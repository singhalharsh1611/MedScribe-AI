import { Router } from 'express';
import pool from '../services/db.service';

const router = Router();

// Create Appointment
router.post('/', async (req, res) => {
  try {
    const { patient_id, clinic_id, doctor_id, appointment_time, reason_for_visit } = req.body;
    
    const result = await pool.query(
      'INSERT INTO appointments (patient_id, clinic_id, doctor_id, appointment_time, reason_for_visit) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [patient_id, clinic_id, doctor_id, appointment_time, reason_for_visit]
    );
    
    res.status(201).json({ appointment: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// List Appointments (Queue)
router.get('/', async (req, res) => {
  try {
    const { clinic_id, doctor_id, status } = req.query;
    
    let query = `
      SELECT a.*, p.first_name, p.last_name, p.uhid, p.gender, p.dob 
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE 1=1
    `;
    let params: any[] = [];
    let paramIndex = 1;
    
    if (clinic_id) {
      query += ` AND a.clinic_id = $${paramIndex++}`;
      params.push(clinic_id);
    }
    if (doctor_id) {
      query += ` AND a.doctor_id = $${paramIndex++}`;
      params.push(doctor_id);
    }
    if (status) {
      query += ` AND a.status = $${paramIndex++}`;
      params.push(status);
    }
    
    query += ' ORDER BY a.appointment_time ASC';
    
    const result = await pool.query(query, params);
    res.json({ appointments: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Appointment Status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await pool.query(
      'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json({ appointment: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
