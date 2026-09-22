import { Router } from 'express';
import pool from '../services/db.service';
import { getPrincipal } from '../middleware/auth.middleware';
import { sendServerError } from '../utils/http-error';
import { renderPrescriptionHtml } from '../services/prescription.service';

const router = Router();

const clinicForRequest = (req: any) => {
  const principal = getPrincipal(req)!;
  return principal.kind === 'superadmin'
    ? Number(req.body?.clinic_id ?? req.query?.clinic_id)
    : principal.clinicId;
};

const isValidPrescription = (value: any) => {
  if (!value || typeof value !== 'object' || Array.isArray(value) || !Array.isArray(value.medications)) return false;
  if (value.medications.length < 1 || value.medications.length > 100) return false;
  const allowedFields = ['medicine', 'name', 'dose', 'route', 'frequency', 'duration', 'instructions', 'dispense', 'refills'];
  return value.medications.every((medication: any) => {
    if (!medication || typeof medication !== 'object' || Array.isArray(medication)) return false;

    // A clinician-reviewed draft may use a generic, compounded, or
    // strength-formatted name that is not an exact catalog brand string.
    const medicineName = medication.medicine ?? medication.name;
    if (typeof medicineName !== 'string' || !medicineName.trim() || medicineName.trim().length > 255) return false;

    return allowedFields.every((field) => {
      const fieldValue = medication[field];
      if (fieldValue === undefined || fieldValue === null) return true;
      if (!['string', 'number'].includes(typeof fieldValue)) return false;
      return typeof fieldValue !== 'string' || fieldValue.length <= 2000;
    });
  });
};

// Register and begin a doctor walk-in consultation without reception intake.
router.post('/walk-in', async (req, res) => {
  const client = await pool.connect();
  try {
    const principal = getPrincipal(req)!;
    if (principal.kind !== 'user' || !['doctor', 'admin'].includes(principal.role)) {
      return res.status(403).json({ error: 'Only a doctor or clinic administrator can start a walk-in consultation' });
    }
    const clinicId = clinicForRequest(req);
    const doctorId = principal.id;
    const { patient, vitals, chief_complaint } = req.body;
    const phone = String(patient?.phone || '').replace(/\D/g, '');
    if (!clinicId || !doctorId || !patient?.first_name?.trim() || !patient?.last_name?.trim()) {
      return res.status(400).json({ error: 'Patient name, phone, doctor, and clinic are required' });
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: 'Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9' });
    }

    await client.query('BEGIN');
    let savedPatient;
    if (patient.id) {
      const existingPatient = await client.query('SELECT * FROM patients WHERE id=$1 AND clinic_id=$2', [patient.id, clinicId]);
      if (existingPatient.rows.length) {
        savedPatient = existingPatient.rows[0];
      }
    }
    if (!savedPatient) {
      const generatedUhid = patient.uhid || `UHID-${Date.now().toString(36).toUpperCase()}`;
      const patientResult = await client.query(
        `INSERT INTO patients (
           first_name, last_name, dob, gender, phone, email, blood_group, uhid, clinic_id, complaint
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [
          patient.first_name.trim(), patient.last_name.trim(), patient.dob || null, patient.gender || null,
          phone, patient.email || null, patient.blood_group || null, generatedUhid,
          clinicId, chief_complaint || patient.complaint || null,
        ],
      );
      savedPatient = patientResult.rows[0];
    }

    // Match the queue token allocation used by reception and keep it race-safe.
    await client.query('SELECT pg_advisory_xact_lock($1::bigint)', [clinicId]);
    const tokenResult = await client.query(
      `SELECT GREATEST(
         COALESCE(MAX(NULLIF(REGEXP_REPLACE(token, '\\D', '', 'g'), '')::integer), 0),
         100
       ) + 1 AS next_token
       FROM queue
       WHERE clinic_id=$1
         AND created_at >= CURRENT_DATE
         AND created_at < CURRENT_DATE + INTERVAL '1 day'`,
      [clinicId],
    );
    const entryResult = await client.query(
      `INSERT INTO queue (patient_id, clinic_id, doctor_id, token, complaint, vitals, status)
       VALUES ($1,$2,$3,$4,$5,$6,'in_consultation') RETURNING *`,
      [
        savedPatient.id, clinicId, doctorId, `T-${tokenResult.rows[0].next_token}`,
        chief_complaint || patient.complaint || null, vitals || null,
      ],
    );
    const entry = entryResult.rows[0];
    const encounterResult = await client.query(
      `INSERT INTO encounters (patient_id, doctor_id, clinic_id, queue_id, chief_complaint)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [savedPatient.id, doctorId, clinicId, entry.id, chief_complaint || patient.complaint || null],
    );

    await client.query('COMMIT');
    res.status(201).json({ patient: savedPatient, entry, encounter: encounterResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    sendServerError(res, 'WALK_IN_START_FAILED', 'Unable to start the walk-in consultation.', error);
  } finally {
    client.release();
  }
});

// Create encounter
router.post('/', async (req, res) => {
  try {
    const { patient_id, chief_complaint } = req.body;
    const principal = getPrincipal(req)!;
    const clinicId = clinicForRequest(req);
    const doctorId = principal.kind === 'user' && principal.role === 'doctor'
      ? principal.id
      : req.body.doctor_id;
    if (!clinicId) return res.status(400).json({ error: 'A valid clinic is required' });
    const r = await pool.query(
      `INSERT INTO encounters (patient_id, doctor_id, clinic_id, chief_complaint)
       SELECT $1,$2,$3,$4
       WHERE EXISTS (SELECT 1 FROM patients WHERE id=$1 AND clinic_id=$3)
         AND EXISTS (SELECT 1 FROM users WHERE id=$2 AND clinic_id=$3)
       RETURNING *`,
      [patient_id, doctorId, clinicId, chief_complaint]
    );
    if (!r.rows.length) return res.status(400).json({ error: 'Patient and doctor must belong to this clinic' });
    res.status(201).json({ encounter: r.rows[0] });
  } catch (error) { sendServerError(res, 'ENCOUNTER_CREATE_FAILED', 'Unable to create the encounter.', error); }
});

// Finalize the clinical encounter and its queue/appointment state atomically.
router.post('/finalize', async (req, res) => {
  const principal = getPrincipal(req)!;
  if (principal.kind !== 'user' || !['doctor', 'admin'].includes(principal.role)) {
    return res.status(403).json({
      code: 'ENCOUNTER_FINALIZE_FORBIDDEN',
      error: 'Only a doctor or clinic administrator can finalize an encounter',
    });
  }
  const clinicId = principal.clinicId;
  const {
    encounter_id,
    patient_id,
    queue_id,
    appointment_id,
    chief_complaint,
    diagnosis,
    prescription,
    transcription,
    audio_url,
    notes,
  } = req.body;
  if (!clinicId || !Number.isInteger(Number(patient_id))) {
    return res.status(400).json({
      code: 'ENCOUNTER_FINALIZE_INVALID_INPUT',
      error: 'A valid patient is required to finalize the encounter',
    });
  }
  if (!isValidPrescription(prescription)) {
    return res.status(400).json({
      code: 'PRESCRIPTION_INVALID',
      error: 'A valid reviewed prescription is required',
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const patient = await client.query(
      `SELECT id, first_name, last_name, dob, gender,
              EXTRACT(YEAR FROM age(CURRENT_DATE, dob))::integer AS age
       FROM patients WHERE id=$1 AND clinic_id=$2 FOR UPDATE`,
      [patient_id, clinicId]
    );
    if (!patient.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ code: 'PATIENT_NOT_FOUND', error: 'Patient not found' });
    }
    const patientRecord = patient.rows[0];
    const authoritativePrescription = {
      ...prescription,
      patient_name: `${patientRecord.first_name} ${patientRecord.last_name}`.trim(),
      patient_age: patientRecord.age ?? 'N/A',
      patient_gender: patientRecord.gender ?? 'N/A',
    };
    const resolvedDiagnosis = authoritativePrescription.final_diagnosis || authoritativePrescription.differential_diagnosis || diagnosis || null;
    const renderedHtml = renderPrescriptionHtml(authoritativePrescription);

    let resolvedQueueId = queue_id == null || queue_id === '' ? null : Number(queue_id);
    if (resolvedQueueId !== null && (!Number.isInteger(resolvedQueueId) || resolvedQueueId <= 0)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ code: 'QUEUE_LINK_INVALID', error: 'The queue entry is invalid' });
    }

    if (resolvedQueueId !== null) {
      const linkedQueue = await client.query(
        `SELECT id FROM queue
         WHERE id=$1 AND patient_id=$2 AND clinic_id=$3
         FOR UPDATE`,
        [resolvedQueueId, patient_id, clinicId]
      );
      if (!linkedQueue.rows.length) {
        // Older walk-in browser state could contain the patient id in place of
        // the queue id. Recover only from this patient's current active visit.
        const activeQueue = await client.query(
          `SELECT id FROM queue
           WHERE patient_id=$1 AND clinic_id=$2
             AND status IN ('called', 'in_consultation')
             AND created_at >= CURRENT_DATE
             AND created_at < CURRENT_DATE + INTERVAL '1 day'
           ORDER BY created_at DESC
           LIMIT 1
           FOR UPDATE`,
          [patient_id, clinicId]
        );
        if (!activeQueue.rows.length) {
          await client.query('ROLLBACK');
          return res.status(409).json({
            code: 'QUEUE_LINK_INVALID',
            error: 'The queue entry does not belong to this patient',
          });
        }
        resolvedQueueId = activeQueue.rows[0].id;
      }
    }

    let resolvedEncounterId = encounter_id;
    if (!resolvedEncounterId && resolvedQueueId !== null) {
      const existing = await client.query(
        `SELECT id FROM encounters
         WHERE queue_id=$1 AND patient_id=$2 AND clinic_id=$3
         FOR UPDATE`,
        [resolvedQueueId, patient_id, clinicId]
      );
      resolvedEncounterId = existing.rows[0]?.id;
    }

    let encounter;
    if (resolvedEncounterId) {
      const result = await client.query(
        `UPDATE encounters SET
           chief_complaint=COALESCE($1, chief_complaint),
           diagnosis=$2,
           notes=$3,
           queue_id=COALESCE(queue_id, $4),
           status='completed',
           ended_at=COALESCE(ended_at, NOW())
         WHERE id=$5 AND patient_id=$6 AND clinic_id=$7
           AND ($4::integer IS NULL OR queue_id IS NULL OR queue_id=$4)
         RETURNING *`,
        [chief_complaint ?? null, resolvedDiagnosis, notes ?? null, resolvedQueueId,
         resolvedEncounterId, patient_id, clinicId]
      );
      encounter = result.rows[0];
    } else {
      const result = await client.query(
        `INSERT INTO encounters
           (patient_id, doctor_id, clinic_id, queue_id, chief_complaint, diagnosis, notes, status, ended_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'completed',NOW())
         RETURNING *`,
        [patient_id, principal.id, clinicId, resolvedQueueId, chief_complaint ?? null, resolvedDiagnosis, notes ?? null]
      );
      encounter = result.rows[0];
    }
    if (!encounter) {
      await client.query('ROLLBACK');
      return res.status(404).json({ code: 'ENCOUNTER_NOT_FOUND', error: 'Encounter not found' });
    }

    if (resolvedQueueId !== null) {
      const queue = await client.query(
        `UPDATE queue SET status='completed'
         WHERE id=$1 AND patient_id=$2 AND clinic_id=$3
         RETURNING id`,
        [resolvedQueueId, patient_id, clinicId]
      );
      if (!queue.rows.length) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          code: 'QUEUE_LINK_INVALID',
          error: 'The queue entry does not match this encounter',
        });
      }
    }

    if (appointment_id) {
      const appointment = await client.query(
        `UPDATE appointments SET status='completed'
         WHERE id=$1 AND patient_id=$2 AND clinic_id=$3
         RETURNING id`,
        [appointment_id, patient_id, clinicId]
      );
      if (!appointment.rows.length) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          code: 'APPOINTMENT_LINK_INVALID',
          error: 'The appointment does not match this encounter',
        });
      }
    }

    const saved = await client.query(
      `INSERT INTO prescriptions
         (patient_name, diagnosis, html_content, transcription_text, timestamp, audio_url,
          clinic_id, user_id, encounter_id, patient_id, prescription_data)
       SELECT CONCAT_WS(' ', first_name, last_name), $1, $2, $3, CURRENT_TIMESTAMP, $4,
              $5, $6, $7, id, $8::jsonb
       FROM patients WHERE id=$9 AND clinic_id=$5
       ON CONFLICT (encounter_id) DO UPDATE SET
         diagnosis=EXCLUDED.diagnosis,
         html_content=EXCLUDED.html_content,
         transcription_text=EXCLUDED.transcription_text,
         audio_url=EXCLUDED.audio_url,
         prescription_data=EXCLUDED.prescription_data
       RETURNING id, serial`,
      [resolvedDiagnosis, renderedHtml, transcription ?? '', audio_url ?? null,
       clinicId, principal.id, encounter.id, JSON.stringify(authoritativePrescription), patient_id]
    );
    const prescriptionId = saved.rows[0].id;
    const serialResult = await client.query(
      `UPDATE prescriptions
       SET serial=COALESCE(serial, 'RX-' || EXTRACT(YEAR FROM CURRENT_DATE)::integer || '-' || LPAD(id::text, 8, '0'))
       WHERE id=$1
       RETURNING id, serial, patient_name, diagnosis, prescription_data, timestamp, encounter_id, patient_id`,
      [prescriptionId]
    );
    await client.query(
      `UPDATE encounters SET prescription_id=$1 WHERE id=$2`,
      [prescriptionId, encounter.id]
    );

    await client.query('COMMIT');
    res.json({ encounter: { ...encounter, prescription_id: prescriptionId }, prescription: serialResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    sendServerError(res, 'ENCOUNTER_FINALIZE_FAILED', 'Unable to finalize the encounter.', error);
  } finally {
    client.release();
  }
});

// Get encounters for a doctor or patient
router.get('/', async (req, res) => {
  try {
    const { doctor_id, patient_id } = req.query;
    const clinicId = clinicForRequest(req);
    if (!clinicId) return res.status(400).json({ error: 'A valid clinic is required' });
    let q = `
      SELECT e.*, p.first_name, p.last_name, p.uhid, u.name as doctor_name
      FROM encounters e
      JOIN patients p ON p.id = e.patient_id
      JOIN users u ON u.id = e.doctor_id
      WHERE e.clinic_id=$1
    `;
    const params: any[] = [clinicId];
    if (doctor_id) { params.push(doctor_id); q += ` AND e.doctor_id=$${params.length}`; }
    if (patient_id) { params.push(patient_id); q += ` AND e.patient_id=$${params.length}`; }
    q += ' ORDER BY e.started_at DESC';
    const r = await pool.query(q, params);
    res.json({ encounters: r.rows });
  } catch (error) { sendServerError(res, 'ENCOUNTERS_READ_FAILED', 'Unable to load encounters.', error); }
});

// Get single encounter
router.get('/:id', async (req, res) => {
  try {
    const clinicId = clinicForRequest(req);
    const r = await pool.query(
      `SELECT e.*, p.first_name, p.last_name, p.uhid, p.dob, p.gender, p.phone,
              u.name as doctor_name
       FROM encounters e
       JOIN patients p ON p.id = e.patient_id
       JOIN users u ON u.id = e.doctor_id
       WHERE e.id=$1 AND e.clinic_id=$2`,
      [req.params.id, clinicId]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Encounter not found' });
    res.json({ encounter: r.rows[0] });
  } catch (error) { sendServerError(res, 'ENCOUNTER_READ_FAILED', 'Unable to load the encounter.', error); }
});

// Update encounter (save draft, finalize)
router.patch('/:id', async (req, res) => {
  try {
    const clinicId = clinicForRequest(req);
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ code: 'ENCOUNTER_UPDATE_INVALID', error: 'A valid update object is required.' });
    }
    const { diagnosis, prescription, notes, status } = req.body;
    if ((diagnosis !== undefined && diagnosis !== null && typeof diagnosis !== 'string') ||
        (notes !== undefined && notes !== null && typeof notes !== 'string') ||
        (prescription !== undefined && prescription !== null && (typeof prescription !== 'object' || Array.isArray(prescription))) ||
        (status !== undefined && !['in_progress', 'completed', 'cancelled'].includes(status))) {
      return res.status(400).json({ code: 'ENCOUNTER_UPDATE_INVALID', error: 'One or more encounter fields are invalid.' });
    }
    const updates: string[] = [];
    const params: any[] = [];
    if (diagnosis !== undefined) { params.push(diagnosis); updates.push(`diagnosis=$${params.length}`); }
    if (prescription !== undefined) { params.push(prescription); updates.push(`prescription=$${params.length}`); }
    if (notes !== undefined) { params.push(notes); updates.push(`notes=$${params.length}`); }
    if (status) { params.push(status); updates.push(`status=$${params.length}`); }
    if (status === 'completed') updates.push(`ended_at=NOW()`);
    if (!updates.length) return res.status(400).json({ code: 'ENCOUNTER_UPDATE_EMPTY', error: 'No valid updates supplied.' });
    params.push(req.params.id);
    params.push(clinicId);
    const r = await pool.query(
      `UPDATE encounters SET ${updates.join(',')} WHERE id=$${params.length - 1} AND clinic_id=$${params.length} RETURNING *`,
      params
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Encounter not found' });
    res.json({ encounter: r.rows[0] });
  } catch (error) { sendServerError(res, 'ENCOUNTER_UPDATE_FAILED', 'Unable to update the encounter.', error); }
});

export default router;
