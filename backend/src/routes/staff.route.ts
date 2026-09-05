import { Router } from 'express';
import pool from '../services/db.service';

const router = Router();

// Get all staff for a clinic
router.get('/', async (req, res) => {
  try {
    const { clinic_id } = req.query;
    const r = await pool.query(
      `SELECT s.*, u.name, u.phone, u.email, u.specialty
       FROM staff s JOIN users u ON u.id = s.user_id
       WHERE s.clinic_id=$1 ORDER BY s.created_at DESC`,
      [clinic_id]
    );
    res.json({ staff: r.rows });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Add staff member
router.post('/', async (req, res) => {
  try {
    const { user_id, clinic_id, role } = req.body;
    const r = await pool.query(
      `INSERT INTO staff (user_id, clinic_id, role)
       VALUES ($1,$2,$3)
       ON CONFLICT (user_id, clinic_id) DO UPDATE SET role=$3
       RETURNING *`,
      [user_id, clinic_id, role]
    );
    res.status(201).json({ staff: r.rows[0] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Update staff status
router.patch('/:id', async (req, res) => {
  try {
    const { status, role } = req.body;
    const updates: string[] = [];
    const params: any[] = [];
    if (status) { params.push(status); updates.push(`status=$${params.length}`); }
    if (role) { params.push(role); updates.push(`role=$${params.length}`); }
    params.push(req.params.id);
    const r = await pool.query(`UPDATE staff SET ${updates.join(',')} WHERE id=$${params.length} RETURNING *`, params);
    res.json({ staff: r.rows[0] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Remove staff
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM staff WHERE id=$1`, [req.params.id]);
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
