import { Router } from 'express';
import pool from '../services/db.service';

const router = Router();

// Create clinic
router.post('/', async (req, res) => {
  try {
    const { name, type, street, city, state, zip, phone, email, admin_id } = req.body;
    const address = [street, city, state, zip].filter(Boolean).join(', ');
    const r = await pool.query(
      `INSERT INTO clinics (name, type, address, phone, email, street, city, state, zip, admin_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [name, type, address, phone, email, street, city, state, zip, admin_id]
    );
    const clinic = r.rows[0];
    // Make creator the admin of the clinic
    if (admin_id) {
      await pool.query(`UPDATE users SET clinic_id=$1, role='admin' WHERE id=$2`, [clinic.id, admin_id]);
    }
    res.status(201).json({ clinic });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// List clinics
router.get('/', async (req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM clinics ORDER BY name ASC`);
    res.json({ clinics: r.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single clinic
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT c.*, COUNT(u.id) as doctor_count
       FROM clinics c LEFT JOIN users u ON u.clinic_id = c.id
       WHERE c.id=$1 GROUP BY c.id`,
      [req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Clinic not found' });
    res.json({ clinic: r.rows[0] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Update clinic
router.patch('/:id', async (req, res) => {
  try {
    const { name, type, phone, email, street, city, state, zip } = req.body;
    const address = [street, city, state, zip].filter(Boolean).join(', ');
    const r = await pool.query(
      `UPDATE clinics SET
        name=COALESCE($1,name), type=COALESCE($2,type),
        phone=COALESCE($3,phone), email=COALESCE($4,email),
        address=COALESCE($5,address)
       WHERE id=$6 RETURNING *`,
      [name, type, phone, email, address || null, req.params.id]
    );
    res.json({ clinic: r.rows[0] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Get doctors for a clinic
router.get('/:id/doctors', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, name, phone, specialty, npi, role, verification_status, created_at
       FROM users WHERE clinic_id=$1 ORDER BY name ASC`,
      [req.params.id]
    );
    res.json({ doctors: r.rows });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Join a clinic (request or direct assign)
router.post('/join', async (req, res) => {
  try {
    const { userId, clinicId } = req.body;
    const r = await pool.query(
      `UPDATE users SET clinic_id=$1 WHERE id=$2 RETURNING id, name, phone, role, clinic_id`,
      [clinicId, userId]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ user: r.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get clinic stats
router.get('/:id/stats', async (req, res) => {
  try {
    const [patients, appointments, doctors, queueCount] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM patients WHERE clinic_id=$1`, [req.params.id]),
      pool.query(`SELECT COUNT(*) FROM appointments WHERE clinic_id=$1 AND DATE(appointment_time)=CURRENT_DATE`, [req.params.id]),
      pool.query(`SELECT COUNT(*) FROM users WHERE clinic_id=$1`, [req.params.id]),
      pool.query(`SELECT COUNT(*) FROM queue WHERE clinic_id=$1 AND status='waiting' AND DATE(created_at)=CURRENT_DATE`, [req.params.id]),
    ]);
    res.json({
      total_patients: parseInt(patients.rows[0].count),
      today_appointments: parseInt(appointments.rows[0].count),
      total_doctors: parseInt(doctors.rows[0].count),
      waiting_queue: parseInt(queueCount.rows[0].count),
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
