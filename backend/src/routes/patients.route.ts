import { Router } from 'express';
import pool from '../services/db.service';
import { getPrincipal } from '../middleware/auth.middleware';
import { sendServerError } from '../utils/http-error';

const router = Router();

const clinicForRequest = (req: any) => {
  const principal = getPrincipal(req)!;
  return principal.kind === 'superadmin'
    ? Number(req.body?.clinic_id ?? req.query?.clinic_id)
    : principal.clinicId;
};

// Register a new patient
router.post('/', async (req, res) => {
  try {
    const { 
      first_name, last_name, dob, gender, phone, email, blood_group, uhid, complaint,
      address, emergency_contact_name, emergency_contact_relation, emergency_contact_phone 
    } = req.body;
    
    const clinicId = clinicForRequest(req);
    if (!clinicId) return res.status(400).json({ error: 'A valid clinic is required' });
    // In a real app, generate UHID properly or check uniqueness
    const generatedUhid = uhid || `UHID-${Date.now().toString(36).toUpperCase()}`;
    const r = await pool.query(
      `INSERT INTO patients (
         first_name, last_name, dob, gender, phone, email, blood_group, uhid, clinic_id, complaint,
         address, emergency_contact_name, emergency_contact_relation, emergency_contact_phone
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [
        first_name, last_name, dob || null, gender, phone, email, blood_group, generatedUhid, clinicId, complaint,
        address, emergency_contact_name, emergency_contact_relation, emergency_contact_phone
      ]
    );
    res.status(201).json({ patient: r.rows[0] });
  } catch (error) { sendServerError(res, 'PATIENT_CREATE_FAILED', 'Unable to create the patient.', error); }
});

// List Patients (with optional search)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const principal = getPrincipal(req)!;
    const clinicId = clinicForRequest(req);
    if (!clinicId) return res.status(400).json({ error: 'A valid clinic is required' });
    const page = Math.max(1, Number.parseInt(String(req.query.page || '1'), 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(String(req.query.limit || '12'), 10) || 12));
    const requestedDoctorId = Number(req.query.doctor_id);
    const doctorId = principal.kind === 'user' && principal.role === 'doctor'
      ? principal.id
      : (Number.isInteger(requestedDoctorId) && requestedDoctorId > 0 ? requestedDoctorId : null);

    let where = ` WHERE p.clinic_id=$1`;
    const params: any[] = [clinicId];
    let doctorParam: number | null = null;
    if (doctorId) {
      params.push(doctorId);
      doctorParam = params.length;
      where += ` AND (
        EXISTS (SELECT 1 FROM appointments assigned_a WHERE assigned_a.patient_id=p.id AND assigned_a.clinic_id=p.clinic_id AND assigned_a.doctor_id=$${doctorParam})
        OR EXISTS (SELECT 1 FROM encounters assigned_e WHERE assigned_e.patient_id=p.id AND assigned_e.clinic_id=p.clinic_id AND assigned_e.doctor_id=$${doctorParam})
      )`;
    }
    if (search) {
      params.push(`%${String(search).trim()}%`);
      where += ` AND (p.first_name ILIKE $${params.length} OR p.last_name ILIKE $${params.length} OR p.uhid ILIKE $${params.length} OR p.phone ILIKE $${params.length})`;
    }

    const doctorAppointmentFilter = doctorParam ? ` AND a.doctor_id=$${doctorParam}` : '';
    const doctorEncounterFilter = doctorParam ? ` AND e.doctor_id=$${doctorParam}` : '';
    const countParams = [...params];
    const dataParams = [...params, limit, (page - 1) * limit];
    const limitParam = dataParams.length - 1;
    const offsetParam = dataParams.length;
    const [countResult, patientResult] = await Promise.all([
      pool.query(`SELECT COUNT(*)::integer AS total FROM patients p${where}`, countParams),
      pool.query(`
        SELECT p.*,
          (SELECT MAX(a.appointment_time) FROM appointments a
           WHERE a.patient_id=p.id AND a.clinic_id=p.clinic_id${doctorAppointmentFilter}) AS last_appointment_at,
          (SELECT COUNT(*)::integer FROM appointments a
           WHERE a.patient_id=p.id AND a.clinic_id=p.clinic_id${doctorAppointmentFilter}) AS appointment_count,
          (SELECT pr.id FROM encounters e
           JOIN prescriptions pr ON pr.encounter_id=e.id AND pr.clinic_id=p.clinic_id
           WHERE e.patient_id=p.id AND e.clinic_id=p.clinic_id${doctorEncounterFilter}
           ORDER BY pr.timestamp DESC, pr.id DESC LIMIT 1) AS latest_prescription_id
        FROM patients p${where}
        ORDER BY COALESCE(
          (SELECT MAX(a.appointment_time) FROM appointments a
           WHERE a.patient_id=p.id AND a.clinic_id=p.clinic_id${doctorAppointmentFilter}),
          p.created_at
        ) DESC
        LIMIT $${limitParam} OFFSET $${offsetParam}
      `, dataParams),
    ]);
    const total = Number(countResult.rows[0]?.total || 0);
    res.json({
      patients: patientResult.rows,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) {
    sendServerError(res, 'PATIENTS_READ_FAILED', 'Unable to load patients.', error);
  }
});

// Get Patient by ID (with encounter history)
router.get('/:id', async (req, res) => {
  try {
    const principal = getPrincipal(req)!;
    const clinicId = clinicForRequest(req);
    if (!clinicId) return res.status(400).json({ error: 'A valid clinic is required' });
    const requestedDoctorId = Number(req.query.doctor_id);
    const doctorId = principal.kind === 'user' && principal.role === 'doctor'
      ? principal.id
      : (Number.isInteger(requestedDoctorId) && requestedDoctorId > 0 ? requestedDoctorId : null);
    const params: any[] = [req.params.id, clinicId];
    let patientScope = '';
    let encounterScope = '';
    let appointmentScope = '';
    if (doctorId) {
      params.push(doctorId);
      patientScope = ` AND (
        EXISTS (SELECT 1 FROM appointments own_a WHERE own_a.patient_id=patients.id AND own_a.clinic_id=patients.clinic_id AND own_a.doctor_id=$3)
        OR EXISTS (SELECT 1 FROM encounters own_e WHERE own_e.patient_id=patients.id AND own_e.clinic_id=patients.clinic_id AND own_e.doctor_id=$3)
      )`;
      encounterScope = ' AND e.doctor_id=$3';
      appointmentScope = ' AND a.doctor_id=$3';
    }
    const [patRes, encRes, apptRes] = await Promise.all([
      pool.query(`SELECT * FROM patients WHERE id=$1 AND clinic_id=$2${patientScope}`, params),
      pool.query(`SELECT e.*, u.name as doctor_name FROM encounters e JOIN users u ON u.id=e.doctor_id WHERE e.patient_id=$1 AND e.clinic_id=$2${encounterScope} ORDER BY e.started_at DESC`, params),
      pool.query(`
        SELECT a.*, u.name AS doctor_name,
               linked_prescription.id AS prescription_id,
               linked_prescription.serial AS prescription_serial
        FROM appointments a
        JOIN users u ON u.id=a.doctor_id
        LEFT JOIN LATERAL (
          SELECT p.id, p.serial
          FROM queue q
          JOIN encounters e ON e.queue_id=q.id
          JOIN prescriptions p ON p.encounter_id=e.id AND p.clinic_id=a.clinic_id
          WHERE q.appointment_id=a.id AND q.patient_id=a.patient_id
          ORDER BY p.timestamp DESC, p.id DESC
          LIMIT 1
        ) linked_prescription ON TRUE
        WHERE a.patient_id=$1 AND a.clinic_id=$2${appointmentScope}
        ORDER BY a.appointment_time DESC
      `, params),
    ]);
    if (!patRes.rows.length) return res.status(404).json({ error: 'Patient not found' });
    res.json({ patient: patRes.rows[0], encounters: encRes.rows, appointments: apptRes.rows });
  } catch (error) {
    sendServerError(res, 'PATIENT_READ_FAILED', 'Unable to load the patient.', error);
  }
});

// Update patient
router.patch('/:id', async (req, res) => {
  try {
    const clinicId = clinicForRequest(req);
    if (!clinicId) return res.status(400).json({ error: 'A valid clinic is required' });
    const { first_name, last_name, dob, gender, phone, email, blood_group, complaint, status } = req.body;
    const r = await pool.query(
      `UPDATE patients SET
        first_name=COALESCE($1,first_name), last_name=COALESCE($2,last_name),
        dob=COALESCE($3,dob), gender=COALESCE($4,gender), phone=COALESCE($5,phone),
        email=COALESCE($6,email), blood_group=COALESCE($7,blood_group),
        complaint=COALESCE($8,complaint), status=COALESCE($9,status)
       WHERE id=$10 AND clinic_id=$11 RETURNING *`,
      [first_name, last_name, dob, gender, phone, email, blood_group, complaint, status, req.params.id, clinicId]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Patient not found' });
    res.json({ patient: r.rows[0] });
  } catch (error) { sendServerError(res, 'PATIENT_UPDATE_FAILED', 'Unable to update the patient.', error); }
});

export default router;
