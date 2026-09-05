import { Router } from 'express';
import pool from '../services/db.service';

const router = Router();

// Create encounter
router.post('/', async (req, res) => {
  try {
    const { patient_id, doctor_id, clinic_id, chief_complaint } = req.body;
    const r = await pool.query(
      `INSERT INTO encounters (patient_id, doctor_id, clinic_id, chief_complaint)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [patient_id, doctor_id, clinic_id, chief_complaint]
    );
    res.status(201).json({ encounter: r.rows[0] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Get encounters for a doctor or patient
router.get('/', async (req, res) => {
  try {
    const { doctor_id, patient_id, clinic_id } = req.query;
    let q = `
      SELECT e.*, p.first_name, p.last_name, p.uhid, u.name as doctor_name
      FROM encounters e
      JOIN patients p ON p.id = e.patient_id
      JOIN users u ON u.id = e.doctor_id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (doctor_id) { params.push(doctor_id); q += ` AND e.doctor_id=$${params.length}`; }
    if (patient_id) { params.push(patient_id); q += ` AND e.patient_id=$${params.length}`; }
    if (clinic_id) { params.push(clinic_id); q += ` AND e.clinic_id=$${params.length}`; }
    q += ' ORDER BY e.started_at DESC';
    const r = await pool.query(q, params);
    res.json({ encounters: r.rows });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Get single encounter
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT e.*, p.first_name, p.last_name, p.uhid, p.dob, p.gender, p.phone,
              u.name as doctor_name
       FROM encounters e
       JOIN patients p ON p.id = e.patient_id
       JOIN users u ON u.id = e.doctor_id
       WHERE e.id=$1`,
      [req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Encounter not found' });
    res.json({ encounter: r.rows[0] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Update encounter (save draft, finalize)
router.patch('/:id', async (req, res) => {
  try {
    const { diagnosis, prescription, notes, status } = req.body;
    const updates: string[] = [];
    const params: any[] = [];
    if (diagnosis !== undefined) { params.push(diagnosis); updates.push(`diagnosis=$${params.length}`); }
    if (prescription !== undefined) { params.push(prescription); updates.push(`prescription=$${params.length}`); }
    if (notes !== undefined) { params.push(notes); updates.push(`notes=$${params.length}`); }
    if (status) { params.push(status); updates.push(`status=$${params.length}`); }
    if (status === 'completed') updates.push(`ended_at=NOW()`);
    params.push(req.params.id);
    const r = await pool.query(
      `UPDATE encounters SET ${updates.join(',')} WHERE id=$${params.length} RETURNING *`,
      params
    );
    res.json({ encounter: r.rows[0] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
