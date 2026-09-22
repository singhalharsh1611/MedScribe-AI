import { Router } from 'express';
import pool from '../services/db.service';
import { getPrincipal } from '../middleware/auth.middleware';
import { sendServerError } from '../utils/http-error';

const router = Router();

// List join requests for a clinic
router.get('/', async (req, res) => {
  try {
    const principal = getPrincipal(req)!;
    if (principal.kind !== 'superadmin' && (principal.role !== 'admin' || principal.clinicId === null)) {
      return res.status(403).json({ error: 'Clinic administrator access is required' });
    }
    const clinicId = principal.kind === 'superadmin' ? req.query.clinic_id : principal.clinicId;
    const { status } = req.query;
    let q = `
      SELECT jr.*, u.name as doctor_name, u.specialty, u.phone, u.npi, u.verification_status,
             c.name as clinic_name
      FROM join_requests jr
      JOIN users u ON u.id = jr.user_id
      JOIN clinics c ON c.id = jr.clinic_id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (clinicId) { params.push(clinicId); q += ` AND jr.clinic_id=$${params.length}`; }
    if (status) { params.push(status); q += ` AND jr.status=$${params.length}`; }
    q += ' ORDER BY jr.created_at DESC';
    const r = await pool.query(q, params);
    res.json({ requests: r.rows });
  } catch (error) { sendServerError(res, 'JOIN_REQUESTS_READ_FAILED', 'Unable to load join requests.', error); }
});

// Create a join request
router.post('/', async (req, res) => {
  try {
    const principal = getPrincipal(req)!;
    if (principal.kind !== 'user' || principal.clinicId !== null) {
      return res.status(403).json({ error: 'Only an unaffiliated user can request clinic membership' });
    }
    const { clinic_id, message } = req.body;
    if (!Number.isInteger(Number(clinic_id))) return res.status(400).json({ error: 'A valid clinic is required' });
    const r = await pool.query(
      `INSERT INTO join_requests (user_id, clinic_id, message)
       VALUES ($1,$2,$3)
       ON CONFLICT (user_id, clinic_id) DO UPDATE SET status='pending', message=$3
       RETURNING *`,
      [principal.id, clinic_id, message]
    );
    res.status(201).json({ request: r.rows[0] });
  } catch (error) { sendServerError(res, 'JOIN_REQUEST_CREATE_FAILED', 'Unable to create the join request.', error); }
});

// Approve or reject a join request
router.patch('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const principal = getPrincipal(req)!;
    if (principal.kind !== 'superadmin' && (principal.role !== 'admin' || principal.clinicId === null)) {
      return res.status(403).json({ error: 'Clinic administrator access is required' });
    }
    const { id } = req.params;
    const { action } = req.body;
    if (action !== 'approve' && action !== 'reject') {
      return res.status(400).json({ error: 'Action must be approve or reject' });
    }
    const status = action === 'approve' ? 'approved' : 'rejected';
    const clinicClause = principal.kind === 'superadmin' ? '' : ' AND clinic_id=$4';
    const reviewerId = principal.kind === 'superadmin' ? null : principal.id;
    const params = principal.kind === 'superadmin'
      ? [status, reviewerId, id]
      : [status, reviewerId, id, principal.clinicId];

    await client.query('BEGIN');
    const r = await client.query(
      `UPDATE join_requests SET status=$1, reviewed_by=$2, reviewed_at=NOW()
       WHERE id=$3${clinicClause} RETURNING *`,
      params
    );
    if (!r.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Request not found' });
    }

    // If approved, assign clinic to user
    if (status === 'approved') {
      const req2 = r.rows[0];
      const assignment = await client.query(
        `UPDATE users SET clinic_id=$1 WHERE id=$2 AND clinic_id IS NULL RETURNING id`,
        [req2.clinic_id, req2.user_id]
      );
      if (!assignment.rows.length) {
        await client.query('ROLLBACK');
        return res.status(409).json({ error: 'User already belongs to a clinic' });
      }
    }
    await client.query('COMMIT');
    res.json({ request: r.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    sendServerError(res, 'JOIN_REQUEST_REVIEW_FAILED', 'Unable to review the join request.', error);
  } finally {
    client.release();
  }
});

// Get join request status for a user
router.get('/user/:user_id', async (req, res) => {
  try {
    const principal = getPrincipal(req)!;
    if (principal.kind !== 'superadmin' && (principal.kind !== 'user' || Number(req.params.user_id) !== principal.id)) {
      return res.status(403).json({ error: 'You can only access your own join request' });
    }
    const r = await pool.query(
      `SELECT jr.*, c.name as clinic_name FROM join_requests jr
       JOIN clinics c ON c.id = jr.clinic_id
       WHERE jr.user_id=$1 ORDER BY jr.created_at DESC LIMIT 1`,
      [req.params.user_id]
    );
    res.json({ request: r.rows[0] || null });
  } catch (error) { sendServerError(res, 'JOIN_REQUEST_READ_FAILED', 'Unable to load the join request.', error); }
});

export default router;
