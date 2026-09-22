import { Router } from 'express';
import pool from '../services/db.service';
import crypto from 'crypto';
import { getPrincipal } from '../middleware/auth.middleware';
import { sendServerError } from '../utils/http-error';

const router = Router();

const hashPin = (pin: string, salt: string = crypto.randomBytes(16).toString('hex')) => {
  const hash = crypto.scryptSync(pin, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

const clinicForRequest = (req: any) => {
  const principal = getPrincipal(req)!;
  return principal.kind === 'superadmin'
    ? Number(req.body?.clinic_id ?? req.query?.clinic_id)
    : principal.clinicId;
};

// Get all staff for a clinic
router.get('/', async (req, res) => {
  try {
    const clinicId = clinicForRequest(req);
    if (!clinicId) return res.status(400).json({ error: 'A valid clinic is required' });
    const r = await pool.query(
      `SELECT id, name, age, gender, phone, role, created_at, pin_reset_required, permissions
       FROM users
       WHERE clinic_id=$1 AND role IN ('receptionist', 'compounder', 'nurse')
       ORDER BY created_at DESC`,
      [clinicId]
    );
    res.json({ staff: r.rows });
  } catch (error) { sendServerError(res, 'STAFF_READ_FAILED', 'Unable to load staff.', error); }
});

// Add staff member
router.post('/', async (req, res) => {
  try {
    const { name, age, gender, phone, role, permissions } = req.body;
    const clinicId = clinicForRequest(req);
    if (!clinicId) return res.status(400).json({ error: 'A valid clinic is required' });
    if (!['receptionist', 'compounder', 'nurse', 'pharmacist'].includes(role)) {
      return res.status(400).json({ error: 'Invalid staff role' });
    }
    
    // Check if phone already exists
    const existing = await pool.query('SELECT id FROM users WHERE phone=$1', [phone]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Phone number already registered' });

    // Staff use a known initial PIN and must replace it immediately after login.
    const tempPin = '123456';
    const hashed = hashPin(tempPin);
    const permsJson = JSON.stringify(permissions || []);
    const email = `staff_${phone}@clinic.local`; // Dummy email for DB constraint

    const r = await pool.query(
      `INSERT INTO users (name, email, age, gender, phone, role, clinic_id, pin, verification_status, pin_reset_required, permissions)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'approved',TRUE,$9)
       RETURNING id, name, age, gender, phone, role, created_at, permissions`,
      [name, email, age, gender, phone, role, clinicId, hashed, permsJson]
    );
    res.status(201).json({ staff: r.rows[0], tempPin });
  } catch (error) { sendServerError(res, 'STAFF_CREATE_FAILED', 'Unable to create the staff account.', error); }
});

// Reset PIN to temp
router.post('/:id/reset-pin', async (req, res) => {
  try {
    const clinicId = clinicForRequest(req);
    if (!clinicId) return res.status(400).json({ error: 'A valid clinic is required' });
    const tempPin = String(crypto.randomInt(100000, 1000000));
    const hashed = hashPin(tempPin);
    const r = await pool.query(
      `UPDATE users SET pin=$1, pin_reset_required=TRUE
       WHERE id=$2 AND clinic_id=$3 AND role IN ('receptionist','compounder','nurse','pharmacist')
       RETURNING id`,
      [hashed, req.params.id, clinicId]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Staff member not found' });
    res.json({ success: true, tempPin });
  } catch (error) { sendServerError(res, 'STAFF_PIN_RESET_FAILED', 'Unable to reset the staff PIN.', error); }
});

// Remove staff
router.delete('/:id', async (req, res) => {
  try {
    const clinicId = clinicForRequest(req);
    if (!clinicId) return res.status(400).json({ error: 'A valid clinic is required' });
    const result = await pool.query(
      `UPDATE users SET clinic_id=NULL, status='inactive'
       WHERE id=$1 AND clinic_id=$2 AND role IN ('receptionist','compounder','nurse','pharmacist')
       RETURNING id, name, role`,
      [req.params.id, clinicId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Staff member not found' });
    res.json({ success: true, user: result.rows[0] });
  } catch (error) { sendServerError(res, 'STAFF_REMOVE_FAILED', 'Unable to remove the staff member.', error); }
});

export default router;
