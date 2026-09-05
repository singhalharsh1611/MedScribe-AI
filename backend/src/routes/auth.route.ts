import { Router } from 'express';
import pool from '../services/db.service';
import crypto from 'crypto';

const router = Router();

const hashPin = (pin: string, salt: string = crypto.randomBytes(16).toString('hex')) => {
  const hash = crypto.scryptSync(pin, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

const verifyPin = (pin: string, storedHash: string) => {
  if (!storedHash?.includes(':')) return pin === storedHash;
  const [salt, key] = storedHash.split(':');
  return crypto.scryptSync(pin, salt, 64).toString('hex') === key;
};

// Check if phone exists
router.post('/check-phone', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone is required' });
    const existing = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);
    res.json({ exists: existing.rows.length > 0 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Registration
router.post('/register', async (req, res) => {
  try {
    const { name, phone, specialty, npi, pin, email } = req.body;
    if (!name || !phone || !pin) return res.status(400).json({ error: 'Name, phone and PIN are required' });

    const existing = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'User already registered with this phone number' });

    const hashedPin = hashPin(pin);
    const result = await pool.query(
      `INSERT INTO users (name, phone, specialty, npi, pin, email, verification_status, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', 'active')
       RETURNING id, name, phone, specialty, npi, role, clinic_id, verification_status`,
      [name, phone, specialty || null, npi || null, hashedPin, email || null]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { phone, pin } = req.body;
    const result = await pool.query(
      `SELECT u.*, c.name as clinic_name FROM users u
       LEFT JOIN clinics c ON c.id = u.clinic_id
       WHERE u.phone = $1`,
      [phone]
    );
    if (!result.rows.length) return res.status(401).json({ error: 'Invalid phone or PIN' });

    const user = result.rows[0];
    if (!verifyPin(pin, user.pin)) return res.status(401).json({ error: 'Invalid phone or PIN' });

    const { pin: _p, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile
router.get('/me/:id', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT u.id, u.name, u.phone, u.email, u.specialty, u.npi, u.role,
              u.clinic_id, u.verification_status, u.status, u.created_at,
              c.name as clinic_name, c.type as clinic_type
       FROM users u LEFT JOIN clinics c ON c.id = u.clinic_id WHERE u.id=$1`,
      [req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ user: r.rows[0] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Update user profile
router.patch('/me/:id', async (req, res) => {
  try {
    const { name, email, specialty, npi } = req.body;
    const r = await pool.query(
      `UPDATE users SET name=COALESCE($1,name), email=COALESCE($2,email),
       specialty=COALESCE($3,specialty), npi=COALESCE($4,npi)
       WHERE id=$5 RETURNING id, name, email, specialty, npi, role, clinic_id, verification_status`,
      [name, email, specialty, npi, req.params.id]
    );
    res.json({ user: r.rows[0] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
