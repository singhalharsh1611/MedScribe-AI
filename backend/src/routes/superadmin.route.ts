import { Router } from 'express';
import pool from '../services/db.service';
import crypto from 'crypto';

const router = Router();

const hashPw = (pw: string, salt = crypto.randomBytes(16).toString('hex')) => {
  const h = crypto.scryptSync(pw, salt, 64).toString('hex');
  return `${salt}:${h}`;
};
const verifyPw = (pw: string, stored: string) => {
  if (!stored?.includes(':')) return pw === stored;
  const [salt, key] = stored.split(':');
  return crypto.scryptSync(pw, salt, 64).toString('hex') === key;
};

// Super admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const r = await pool.query('SELECT * FROM super_admins WHERE username=$1', [username]);
    if (!r.rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const admin = r.rows[0];
    if (!verifyPw(password, admin.password_hash)) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ admin: { id: admin.id, username: admin.username } });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// List all doctors pending verification
router.get('/doctors', async (req, res) => {
  try {
    const { status } = req.query;
    let q = `SELECT u.*, c.name as clinic_name FROM users u
             LEFT JOIN clinics c ON c.id = u.clinic_id
             WHERE u.role IN ('doctor','admin')`;
    const params: any[] = [];
    if (status) { q += ` AND u.verification_status = $1`; params.push(status); }
    q += ' ORDER BY u.created_at DESC';
    const r = await pool.query(q, params);
    res.json({ doctors: r.rows });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Approve or reject a doctor
router.patch('/doctors/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' | 'reject'
    const status = action === 'approve' ? 'approved' : 'rejected';
    const r = await pool.query(
      `UPDATE users SET verification_status=$1 WHERE id=$2 RETURNING id, name, verification_status`,
      [status, id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Doctor not found' });
    res.json({ doctor: r.rows[0] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// List all clinics
router.get('/clinics', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT c.*, COUNT(u.id) as doctor_count
      FROM clinics c LEFT JOIN users u ON u.clinic_id = c.id
      GROUP BY c.id ORDER BY c.created_at DESC
    `);
    res.json({ clinics: r.rows });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Platform stats
router.get('/stats', async (req, res) => {
  try {
    const [doctors, clinics, patients, pending] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM users WHERE role='doctor'`),
      pool.query(`SELECT COUNT(*) FROM clinics`),
      pool.query(`SELECT COUNT(*) FROM patients`),
      pool.query(`SELECT COUNT(*) FROM users WHERE verification_status='pending'`),
    ]);
    res.json({
      total_doctors: parseInt(doctors.rows[0].count),
      total_clinics: parseInt(clinics.rows[0].count),
      total_patients: parseInt(patients.rows[0].count),
      pending_verifications: parseInt(pending.rows[0].count),
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
