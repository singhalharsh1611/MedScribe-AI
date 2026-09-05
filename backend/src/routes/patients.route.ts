import { Router } from 'express';
import pool from '../services/db.service';

const router = Router();

// Add Patient
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, dob, gender, phone, email, blood_group, uhid, clinic_id, complaint } = req.body;
    if (!first_name || !last_name) return res.status(400).json({ error: 'First and last name are required' });

    const generatedUhid = uhid || `UHID-${Date.now().toString(36).toUpperCase()}`;
    const r = await pool.query(
      `INSERT INTO patients (first_name, last_name, dob, gender, phone, email, blood_group, uhid, clinic_id, complaint)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [first_name, last_name, dob || null, gender, phone, email, blood_group, generatedUhid, clinic_id, complaint]
    );
    res.status(201).json({ patient: r.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// List Patients (with optional search)
router.get('/', async (req, res) => {
  try {
    const { clinic_id, search } = req.query;
    let q = `SELECT * FROM patients WHERE 1=1`;
    const params: any[] = [];
    if (clinic_id) { params.push(clinic_id); q += ` AND clinic_id=$${params.length}`; }
    if (search) { params.push(`%${search}%`); q += ` AND (first_name ILIKE $${params.length} OR last_name ILIKE $${params.length} OR uhid ILIKE $${params.length} OR phone ILIKE $${params.length})`; }
    q += ' ORDER BY created_at DESC';
    const r = await pool.query(q, params);
    res.json({ patients: r.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Patient by ID (with encounter history)
router.get('/:id', async (req, res) => {
  try {
    const [patRes, encRes, apptRes] = await Promise.all([
      pool.query(`SELECT * FROM patients WHERE id=$1`, [req.params.id]),
      pool.query(`SELECT e.*, u.name as doctor_name FROM encounters e JOIN users u ON u.id=e.doctor_id WHERE e.patient_id=$1 ORDER BY e.started_at DESC`, [req.params.id]),
      pool.query(`SELECT a.*, u.name as doctor_name FROM appointments a JOIN users u ON u.id=a.doctor_id WHERE a.patient_id=$1 ORDER BY a.appointment_time DESC`, [req.params.id]),
    ]);
    if (!patRes.rows.length) return res.status(404).json({ error: 'Patient not found' });
    res.json({ patient: patRes.rows[0], encounters: encRes.rows, appointments: apptRes.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update patient
router.patch('/:id', async (req, res) => {
  try {
    const { first_name, last_name, dob, gender, phone, email, blood_group, complaint, status } = req.body;
    const r = await pool.query(
      `UPDATE patients SET
        first_name=COALESCE($1,first_name), last_name=COALESCE($2,last_name),
        dob=COALESCE($3,dob), gender=COALESCE($4,gender), phone=COALESCE($5,phone),
        email=COALESCE($6,email), blood_group=COALESCE($7,blood_group),
        complaint=COALESCE($8,complaint), status=COALESCE($9,status)
       WHERE id=$10 RETURNING *`,
      [first_name, last_name, dob, gender, phone, email, blood_group, complaint, status, req.params.id]
    );
    res.json({ patient: r.rows[0] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
