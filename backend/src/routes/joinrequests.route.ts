import { Router } from 'express';
import pool from '../services/db.service';

const router = Router();

// List join requests for a clinic
router.get('/', async (req, res) => {
  try {
    const { clinic_id, status } = req.query;
    let q = `
      SELECT jr.*, u.name as doctor_name, u.specialty, u.phone, u.npi, u.verification_status,
             c.name as clinic_name
      FROM join_requests jr
      JOIN users u ON u.id = jr.user_id
      JOIN clinics c ON c.id = jr.clinic_id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (clinic_id) { params.push(clinic_id); q += ` AND jr.clinic_id=$${params.length}`; }
    if (status) { params.push(status); q += ` AND jr.status=$${params.length}`; }
    q += ' ORDER BY jr.created_at DESC';
    const r = await pool.query(q, params);
    res.json({ requests: r.rows });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Create a join request
router.post('/', async (req, res) => {
  try {
    const { user_id, clinic_id, message } = req.body;
    const r = await pool.query(
      `INSERT INTO join_requests (user_id, clinic_id, message)
       VALUES ($1,$2,$3)
       ON CONFLICT (user_id, clinic_id) DO UPDATE SET status='pending', message=$3
       RETURNING *`,
      [user_id, clinic_id, message]
    );
    res.status(201).json({ request: r.rows[0] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Approve or reject a join request
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reviewed_by } = req.body;
    const status = action === 'approve' ? 'approved' : 'rejected';

    const r = await pool.query(
      `UPDATE join_requests SET status=$1, reviewed_by=$2, reviewed_at=NOW()
       WHERE id=$3 RETURNING *, (SELECT user_id FROM join_requests WHERE id=$3) as uid,
                                 (SELECT clinic_id FROM join_requests WHERE id=$3) as cid`,
      [status, reviewed_by, id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Request not found' });

    // If approved, assign clinic to user
    if (status === 'approved') {
      const req2 = r.rows[0];
      await pool.query(`UPDATE users SET clinic_id=$1 WHERE id=$2`, [req2.clinic_id, req2.user_id]);
    }
    res.json({ request: r.rows[0] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Get join request status for a user
router.get('/user/:user_id', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT jr.*, c.name as clinic_name FROM join_requests jr
       JOIN clinics c ON c.id = jr.clinic_id
       WHERE jr.user_id=$1 ORDER BY jr.created_at DESC LIMIT 1`,
      [req.params.user_id]
    );
    res.json({ request: r.rows[0] || null });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
