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

// Store active SSE clients
const clients: { clinicId: string, doctorId: string | undefined, res: any }[] = [];

// Broadcast updated queue to relevant SSE clients
const notifyClients = async (clinicId: string | number) => {
  for (const client of clients) {
    if (client.clinicId === String(clinicId)) {
      try {
        let q = `
          SELECT q.*, p.first_name, p.last_name, p.phone, p.gender, p.dob, p.uhid,
                 u.name as doctor_name
          FROM queue q
          JOIN patients p ON p.id = q.patient_id
          LEFT JOIN users u ON u.id = q.doctor_id
          WHERE q.clinic_id = $1
            AND q.created_at >= CURRENT_DATE
            AND q.created_at < CURRENT_DATE + INTERVAL '1 day'
        `;
        const params: any[] = [clinicId];
        if (client.doctorId && client.doctorId !== 'undefined') { 
          q += ` AND q.doctor_id = $2`; 
          params.push(client.doctorId); 
        }
        q += ' ORDER BY q.created_at ASC';
        
        const r = await pool.query(q, params);
        client.res.write(`data: ${JSON.stringify(r.rows)}\n\n`);
      } catch (e) {
        console.error('SSE Broadcast error:', e);
      }
    }
  }
};

// SSE Stream Endpoint
router.get('/stream', (req, res) => {
  const clinicId = clinicForRequest(req);
  const { doctor_id } = req.query;
  if (!clinicId) return res.status(400).json({ error: 'A valid clinic is required' });
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const client = { clinicId: String(clinicId), doctorId: doctor_id ? String(doctor_id) : undefined, res };
  clients.push(client);

  req.on('close', () => {
    const idx = clients.indexOf(client);
    if (idx !== -1) clients.splice(idx, 1);
  });
});

// Get queue for a clinic (Initial load)
router.get('/', async (req, res) => {
  try {
    const { doctor_id } = req.query;
    const clinicId = clinicForRequest(req);
    if (!clinicId) return res.status(400).json({ error: 'A valid clinic is required' });
    let q = `
      SELECT q.*, p.first_name, p.last_name, p.phone, p.gender, p.dob, p.uhid,
             u.name as doctor_name
      FROM queue q
      JOIN patients p ON p.id = q.patient_id
      LEFT JOIN users u ON u.id = q.doctor_id
      WHERE q.clinic_id = $1
        AND q.created_at >= CURRENT_DATE
        AND q.created_at < CURRENT_DATE + INTERVAL '1 day'
    `;
    const params: any[] = [clinicId];
    if (doctor_id && doctor_id !== 'undefined') { q += ` AND q.doctor_id = $2`; params.push(doctor_id); }
    q += ' ORDER BY q.created_at ASC';
    const r = await pool.query(q, params);
    res.json({ queue: r.rows });
  } catch (error) { sendServerError(res, 'QUEUE_READ_FAILED', 'Unable to load the queue.', error); }
});

// Add patient to queue
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { patient_id, doctor_id, complaint, appointment_id, vitals } = req.body;
    const clinicId = clinicForRequest(req);
    if (!clinicId) return res.status(400).json({ error: 'A valid clinic is required' });
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1::bigint)', [clinicId]);
    const tokenRes = await client.query(
      `SELECT GREATEST(
         COALESCE(MAX(NULLIF(REGEXP_REPLACE(token, '\\D', '', 'g'), '')::integer), 0),
         100
       ) + 1 AS next_token
       FROM queue
       WHERE clinic_id=$1
         AND created_at >= CURRENT_DATE
         AND created_at < CURRENT_DATE + INTERVAL '1 day'`,
      [clinicId]
    );
    const token = `T-${tokenRes.rows[0].next_token}`;

    const r = await client.query(
      `INSERT INTO queue (patient_id, clinic_id, doctor_id, token, complaint, appointment_id, vitals)
       SELECT $1, $2, $3, $4, $5, $6, $7
       WHERE EXISTS (SELECT 1 FROM patients WHERE id=$1 AND clinic_id=$2)
         AND ($3::integer IS NULL OR EXISTS (SELECT 1 FROM users WHERE id=$3 AND clinic_id=$2))
         AND ($6::integer IS NULL OR EXISTS (SELECT 1 FROM appointments WHERE id=$6 AND clinic_id=$2))
       RETURNING *`,
      [patient_id, clinicId, doctor_id || null, token, complaint, appointment_id || null, vitals || null]
    );
    if (!r.rows.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Patient and doctor must belong to this clinic' });
    }
    await client.query('COMMIT');
    
    notifyClients(clinicId); // Notify
    res.status(201).json({ entry: r.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    sendServerError(res, 'QUEUE_CREATE_FAILED', 'Unable to add the queue entry.', error);
  } finally {
    client.release();
  }
});

// Update queue entry status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const clinicId = clinicForRequest(req);
    if (!['waiting', 'called', 'in_consultation', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ code: 'QUEUE_STATUS_INVALID', error: 'Invalid queue status.' });
    }
    const r = await pool.query(
      `UPDATE queue
       SET status=$1::varchar,
           called_at=CASE WHEN $1::varchar='called' THEN NOW() ELSE called_at END
       WHERE id=$2 AND clinic_id=$3 RETURNING *`,
      [status, id, clinicId]
    );
    
    if (!r.rows[0]) return res.status(404).json({ code: 'QUEUE_ENTRY_NOT_FOUND', error: 'Queue entry not found.' });
    notifyClients(r.rows[0].clinic_id); // Notify
    res.json({ entry: r.rows[0] });
  } catch (error) { sendServerError(res, 'QUEUE_UPDATE_FAILED', 'Unable to update the queue entry.', error); }
});

// Remove from queue
router.delete('/:id', async (req, res) => {
  try {
    const clinicId = clinicForRequest(req);
    const q = await pool.query(
      `DELETE FROM queue WHERE id=$1 AND clinic_id=$2 RETURNING clinic_id`,
      [req.params.id, clinicId]
    );
    const removedClinicId = q.rows[0]?.clinic_id;
    if (!removedClinicId) return res.status(404).json({ error: 'Queue entry not found' });
    notifyClients(removedClinicId); // Notify
    res.json({ success: true });
  } catch (error) { sendServerError(res, 'QUEUE_DELETE_FAILED', 'Unable to remove the queue entry.', error); }
});

export default router;
