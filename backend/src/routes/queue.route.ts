import { Router } from 'express';
import pool from '../services/db.service';

const router = Router();

// Get queue for a clinic
router.get('/', async (req, res) => {
  try {
    const { clinic_id, doctor_id } = req.query;
    let q = `
      SELECT q.*, p.first_name, p.last_name, p.phone, p.gender, p.dob,
             u.name as doctor_name
      FROM queue q
      JOIN patients p ON p.id = q.patient_id
      LEFT JOIN users u ON u.id = q.doctor_id
      WHERE q.clinic_id = $1
    `;
    const params: any[] = [clinic_id];
    if (doctor_id) { q += ` AND q.doctor_id = $2`; params.push(doctor_id); }
    q += ' ORDER BY q.created_at ASC';
    const r = await pool.query(q, params);
    res.json({ queue: r.rows });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Add patient to queue
router.post('/', async (req, res) => {
  try {
    const { patient_id, clinic_id, doctor_id, complaint, appointment_id } = req.body;
    // Generate token
    const countRes = await pool.query(`SELECT COUNT(*) FROM queue WHERE clinic_id=$1 AND DATE(created_at)=CURRENT_DATE`, [clinic_id]);
    const token = `T-${String(parseInt(countRes.rows[0].count) + 101)}`;

    const r = await pool.query(
      `INSERT INTO queue (patient_id, clinic_id, doctor_id, token, complaint, appointment_id)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [patient_id, clinic_id, doctor_id, token, complaint, appointment_id]
    );
    res.status(201).json({ entry: r.rows[0] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Update queue entry status (call, complete, skip)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const called_at = status === 'called' ? new Date() : null;
    const r = await pool.query(
      `UPDATE queue SET status=$1 ${called_at ? ', called_at=NOW()' : ''} WHERE id=$2 RETURNING *`,
      [status, id]
    );
    res.json({ entry: r.rows[0] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Remove from queue
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM queue WHERE id=$1`, [req.params.id]);
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
