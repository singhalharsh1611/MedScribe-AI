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

// Create Appointment
router.post('/', async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_time, reason_for_visit } = req.body;
    const clinicId = clinicForRequest(req);
    if (!clinicId) return res.status(400).json({ error: 'A valid clinic is required' });
    
    const result = await pool.query(
      `INSERT INTO appointments (patient_id, clinic_id, doctor_id, appointment_time, reason_for_visit)
       SELECT $1, $2, $3, $4, $5
       WHERE EXISTS (SELECT 1 FROM patients WHERE id=$1 AND clinic_id=$2)
         AND EXISTS (SELECT 1 FROM users WHERE id=$3 AND clinic_id=$2)
       RETURNING *`,
      [patient_id, clinicId, doctor_id, appointment_time, reason_for_visit]
    );
    if (!result.rows.length) return res.status(400).json({ error: 'Patient and doctor must belong to this clinic' });
    
    res.status(201).json({ appointment: result.rows[0] });
  } catch (error) {
    sendServerError(res, 'APPOINTMENT_CREATE_FAILED', 'Unable to create the appointment.', error);
  }
});

// List Appointments
router.get('/', async (req, res) => {
  try {
    const { doctor_id, status, date } = req.query;
    const clinicId = clinicForRequest(req);
    if (!clinicId) return res.status(400).json({ error: 'A valid clinic is required' });
    
    let query = `
      SELECT a.*, p.first_name, p.last_name, p.uhid, p.gender, p.dob 
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.clinic_id = $1
    `;
    let params: any[] = [clinicId];
    let paramIndex = 2;
    if (doctor_id) {
      query += ` AND a.doctor_id = $${paramIndex++}`;
      params.push(doctor_id);
    }
    if (status) {
      query += ` AND a.status = $${paramIndex++}`;
      params.push(status);
    }
    // Filter by a specific date, defaulting to today unless the caller requests all records.
    if (date !== 'all') {
      const targetDate = (date as string) || new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
      query += ` AND a.appointment_time >= $${paramIndex}::date AND a.appointment_time < $${paramIndex}::date + INTERVAL '1 day'`;
      paramIndex++;
      params.push(targetDate);
    }
    
    query += ' ORDER BY a.appointment_time ASC';
    
    const result = await pool.query(query, params);
    res.json({ appointments: result.rows });
  } catch (error) {
    sendServerError(res, 'APPOINTMENTS_READ_FAILED', 'Unable to load appointments.', error);
  }
});

// Update Appointment Status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const clinicId = clinicForRequest(req);
    
    const result = await pool.query(
      'UPDATE appointments SET status = $1 WHERE id = $2 AND clinic_id=$3 RETURNING *',
      [status, id, clinicId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json({ appointment: result.rows[0] });
  } catch (error) {
    sendServerError(res, 'APPOINTMENT_STATUS_UPDATE_FAILED', 'Unable to update appointment status.', error);
  }
});

// Update Appointment
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { doctor_id, appointment_time, reason_for_visit, status } = req.body;
    const clinicId = clinicForRequest(req);
    
    const result = await pool.query(
      `UPDATE appointments SET doctor_id = COALESCE($1, doctor_id), appointment_time = COALESCE($2, appointment_time),
       reason_for_visit = COALESCE($3, reason_for_visit), status = COALESCE($4, status)
       WHERE id = $5 AND clinic_id=$6
         AND ($1::integer IS NULL OR EXISTS (SELECT 1 FROM users WHERE id=$1 AND clinic_id=$6))
       RETURNING *`,
      [doctor_id || null, appointment_time || null, reason_for_visit || null, status || null, id, clinicId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json({ appointment: result.rows[0] });
  } catch (error) {
    sendServerError(res, 'APPOINTMENT_UPDATE_FAILED', 'Unable to update the appointment.', error);
  }
});


// Delete Appointment
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const clinicId = clinicForRequest(req);
    const result = await pool.query("DELETE FROM appointments WHERE id = $1 AND clinic_id=$2 RETURNING *", [id, clinicId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json({ success: true, appointment: result.rows[0] });
  } catch (error) {
    sendServerError(res, 'APPOINTMENT_DELETE_FAILED', 'Unable to delete the appointment.', error);
  }
});

export default router;
