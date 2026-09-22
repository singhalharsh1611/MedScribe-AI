import { Router } from 'express';
import pool from '../services/db.service';
import crypto from 'crypto';
import {
  authRateLimit,
  clearSessionCookie,
  createSessionToken,
  getPrincipal,
  requireAuth,
  setSessionCookie,
} from '../middleware/auth.middleware';
import { sendServerError } from '../utils/http-error';

const router = Router();

const hashPin = (pin: string, salt: string = crypto.randomBytes(16).toString('hex')) => {
  const hash = crypto.scryptSync(pin, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

const verifyPin = (pin: string, storedHash: string) => {
  if (!storedHash?.includes(':')) return pin === storedHash;
  const [salt, key] = storedHash.split(':');
  const actual = Buffer.from(crypto.scryptSync(pin, salt, 64).toString('hex'));
  const expected = Buffer.from(key);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
};

const issueUserSession = (res: any, user: any) => {
  setSessionCookie(res, createSessionToken({
    id: Number(user.id),
    role: user.role || 'doctor',
    clinicId: user.clinic_id !== undefined
      ? (user.clinic_id === null ? null : Number(user.clinic_id))
      : (user.clinicId ?? null),
    kind: 'user',
    pinResetRequired: Boolean(user.pin_reset_required ?? user.pinResetRequired),
  }));
};

const pinValidationError = (pin: unknown) => {
  const value = String(pin || '');
  if (!/^\d{6}$/.test(value)) return 'PIN must contain exactly 6 digits';
  if (/^(\d)\1{5}$/.test(value)) return 'PIN cannot use the same digit six times';
  if (new Set(['123456', '654321', '012345', '543210']).has(value)) {
    return 'Choose a less predictable PIN';
  }
  return null;
};

// Check if phone exists
router.post('/check-phone', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone is required' });
    const existing = await pool.query('SELECT id, verification_status FROM users WHERE phone = $1', [phone]);
    
    if (existing.rows.length > 0 && existing.rows[0].verification_status === 'rejected') {
      // Allow rejected users to re-register
      return res.json({ exists: false });
    }
    
    res.json({ exists: existing.rows.length > 0 });
  } catch (error) {
    sendServerError(res, 'AUTH_PHONE_CHECK_FAILED', 'Unable to check this phone number.', error);
  }
});

// Registration
router.post('/register', async (req, res) => {
  try {
    const { name, phone, specialty, npi, pin, email } = req.body;
    if (!name || !phone || !pin) return res.status(400).json({ error: 'Name, phone and PIN are required' });
    const pinError = pinValidationError(pin);
    if (pinError) return res.status(400).json({ error: pinError });

    const existing = await pool.query('SELECT id, verification_status FROM users WHERE phone = $1', [phone]);
    if (existing.rows.length > 0) {
      if (existing.rows[0].verification_status === 'rejected') {
        const hashedPin = hashPin(pin);
        const result = await pool.query(
          `UPDATE users SET name=$1, specialty=$2, npi=$3, pin=$4, email=$5, verification_status='pending', status='active'
           WHERE id=$6
           RETURNING id, name, phone, specialty, npi, role, clinic_id, verification_status`,
          [name, specialty || null, npi || null, hashedPin, email || null, existing.rows[0].id]
        );
        issueUserSession(res, result.rows[0]);
        return res.status(200).json({ user: result.rows[0] });
      }
      return res.status(400).json({ error: 'User already registered with this phone number' });
    }

    const hashedPin = hashPin(pin);
    const result = await pool.query(
      `INSERT INTO users (name, phone, specialty, npi, pin, email, verification_status, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', 'active')
       RETURNING id, name, phone, specialty, npi, role, clinic_id, verification_status`,
      [name, phone, specialty || null, npi || null, hashedPin, email || null]
    );
    issueUserSession(res, result.rows[0]);
    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    sendServerError(res, 'AUTH_REGISTRATION_FAILED', 'Unable to register the account.', error);
  }
});

// Login
router.post('/login', authRateLimit, async (req, res) => {
  try {
    const { phone, pin } = req.body;
    const result = await pool.query(
      `SELECT u.id, u.name, u.phone, u.email, u.age, u.gender, u.specialty, u.npi,
              u.role, u.permissions, u.clinic_id, u.verification_status, u.status,
              u.pin_reset_required, u.created_at, u.pin, c.name as clinic_name
       FROM users u
       LEFT JOIN clinics c ON c.id = u.clinic_id
       WHERE u.phone = $1`,
      [phone]
    );
    if (!result.rows.length) return res.status(401).json({ error: 'Invalid phone or PIN' });

    const user = result.rows[0];
    if (!verifyPin(pin, user.pin)) return res.status(401).json({ error: 'Invalid phone or PIN' });

    const { pin: _p, ...safeUser } = user;
    issueUserSession(res, safeUser);
    res.json({ user: safeUser });
  } catch (error) {
    sendServerError(res, 'AUTH_LOGIN_FAILED', 'Unable to sign in.', error);
  }
});

router.post('/logout', (_req, res) => {
  clearSessionCookie(res);
  res.json({ success: true });
});

router.use(requireAuth);

// Get user profile
router.get('/me/:id', async (req, res) => {
  try {
    const principal = getPrincipal(req)!;
    if (principal.kind !== 'superadmin' && Number(req.params.id) !== principal.id) {
      return res.status(403).json({ error: 'You can only access your own profile' });
    }
    const r = await pool.query(
      `SELECT u.id, u.name, u.phone, u.email, u.specialty, u.npi, u.role, u.permissions,
              u.clinic_id, u.verification_status, u.status, u.pin_reset_required, u.created_at,
              c.name as clinic_name, c.type as clinic_type
       FROM users u LEFT JOIN clinics c ON c.id = u.clinic_id WHERE u.id=$1`,
      [req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ user: r.rows[0] });
  } catch (error) { sendServerError(res, 'AUTH_PROFILE_READ_FAILED', 'Unable to load the profile.', error); }
});

// Update user profile
router.patch('/me/:id', async (req, res) => {
  try {
    const principal = getPrincipal(req)!;
    if (principal.kind !== 'superadmin' && Number(req.params.id) !== principal.id) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }
    const { name, email, specialty, npi } = req.body;
    const r = await pool.query(
      `UPDATE users SET name=COALESCE($1,name), email=COALESCE($2,email),
       specialty=COALESCE($3,specialty), npi=COALESCE($4,npi)
       WHERE id=$5 RETURNING id, name, email, specialty, npi, role, clinic_id, verification_status`,
      [name, email, specialty, npi, req.params.id]
    );
    res.json({ user: r.rows[0] });
  } catch (error) { sendServerError(res, 'AUTH_PROFILE_UPDATE_FAILED', 'Unable to update the profile.', error); }
});

// Update PIN
router.patch('/pin/:id', authRateLimit, async (req, res) => {
  try {
    const principal = getPrincipal(req)!;
    if (principal.kind !== 'user' || Number(req.params.id) !== principal.id) {
      return res.status(403).json({ error: 'You can only change your own PIN' });
    }
    const { pin, current_pin } = req.body;
    const pinError = pinValidationError(pin);
    if (pinError) return res.status(400).json({ error: pinError });
    const existing = await pool.query(
      'SELECT pin, pin_reset_required FROM users WHERE id=$1',
      [principal.id]
    );
    if (!existing.rows.length) return res.status(404).json({ error: 'User not found' });
    if (!existing.rows[0].pin_reset_required) {
      if (!current_pin || !verifyPin(String(current_pin), existing.rows[0].pin)) {
        return res.status(401).json({ error: 'Current PIN is incorrect' });
      }
    }
    const hashed = hashPin(pin);
    await pool.query(
      `UPDATE users SET pin=$1, pin_reset_required=FALSE WHERE id=$2`,
      [hashed, principal.id]
    );
    issueUserSession(res, { ...principal, pinResetRequired: false });
    res.json({ success: true });
  } catch (error) {
    sendServerError(res, 'AUTH_PIN_UPDATE_FAILED', 'Unable to update the PIN.', error);
  }
});

export default router;
