import { Router } from 'express';
import pool from '../services/db.service';
import { getPrincipal } from '../middleware/auth.middleware';
import { sendServerError } from '../utils/http-error';

const router = Router();

const canAdministerClinic = (req: any, clinicId: number) => {
  const principal = getPrincipal(req)!;
  return principal.kind === 'superadmin' ||
    (principal.role === 'admin' && principal.clinicId === clinicId);
};

// Create clinic
router.post('/', async (req, res) => {
  try {
    const { name, type, street, city, state, zip, phone, email } = req.body;
    const principal = getPrincipal(req)!;
    if (principal.kind !== 'user') {
      return res.status(403).json({
        code: 'USER_SESSION_REQUIRED',
        error: 'Sign in with your practitioner account to create a clinic',
      });
    }
    if (principal.clinicId !== null) {
      return res.status(409).json({
        code: 'CLINIC_ALREADY_ASSIGNED',
        error: 'This practitioner already belongs to a clinic',
      });
    }
    const adminId = principal.id;
    const address = [street, city, state, zip].filter(Boolean).join(', ');
    const r = await pool.query(
      `INSERT INTO clinics (name, type, address, phone, email, street, city, state, zip, admin_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [name, type, address, phone, email, street, city, state, zip, adminId]
    );
    const clinic = r.rows[0];
    // Make creator the admin of the clinic
    await pool.query(`UPDATE users SET clinic_id=$1, role='admin' WHERE id=$2`, [clinic.id, adminId]);
    res.status(201).json({ clinic });
  } catch (error) {
    sendServerError(res, 'CLINIC_CREATE_FAILED', 'Unable to create the clinic.', error);
  }
});

// List clinics
router.get('/', async (req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM clinics ORDER BY name ASC`);
    res.json({ clinics: r.rows });
  } catch (error) {
    sendServerError(res, 'CLINICS_READ_FAILED', 'Unable to load clinics.', error);
  }
});

// Get single clinic
router.get('/:id', async (req, res) => {
  try {
    const principal = getPrincipal(req)!;
    if (principal.kind !== 'superadmin' && Number(req.params.id) !== principal.clinicId) {
      return res.status(403).json({ error: 'Clinic membership is required' });
    }
    const r = await pool.query(
      `SELECT c.*, COUNT(u.id) as doctor_count
       FROM clinics c LEFT JOIN users u ON u.clinic_id = c.id
       WHERE c.id=$1 GROUP BY c.id`,
      [req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Clinic not found' });
    res.json({ clinic: r.rows[0] });
  } catch (error) { sendServerError(res, 'CLINIC_READ_FAILED', 'Unable to load the clinic.', error); }
});

// Update clinic
router.patch('/:id', async (req, res) => {
  try {
    if (!canAdministerClinic(req, Number(req.params.id))) {
      return res.status(403).json({ error: 'Clinic administrator access is required' });
    }
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
    if (!r.rows.length) return res.status(404).json({ code: 'CLINIC_NOT_FOUND', error: 'Clinic not found.' });
    res.json({ clinic: r.rows[0] });
  } catch (error) { sendServerError(res, 'CLINIC_UPDATE_FAILED', 'Unable to update the clinic.', error); }
});

// Get users for a clinic
router.get('/:id/doctors', async (req, res) => {
  try {
    const clinicId = Number(req.params.id);
    const principal = getPrincipal(req)!;
    const isClinicAdmin = canAdministerClinic(req, clinicId);
    const isClinicMember = principal.kind === 'user' && principal.clinicId === clinicId;

    if (!isClinicAdmin && !isClinicMember) {
      return res.status(403).json({ error: 'Clinic membership is required' });
    }

    // Administrators use this endpoint to manage the full clinic roster. Other
    // clinic staff only need a minimal clinician list for appointment and queue
    // assignment, so do not expose staff contact or account-security fields.
    const fields = isClinicAdmin
      ? 'id, name, phone, age, gender, specialty, npi, role, permissions, verification_status, pin_reset_required, created_at'
      : 'id, name, specialty, role';
    const roleFilter = isClinicAdmin ? '' : ` AND role IN ('doctor', 'admin')`;
    const r = await pool.query(
      `SELECT ${fields} FROM users WHERE clinic_id=$1${roleFilter} ORDER BY name ASC`,
      [clinicId]
    );
    res.json({ doctors: r.rows });
  } catch (error) { sendServerError(res, 'CLINIC_USERS_READ_FAILED', 'Unable to load clinic users.', error); }
});

// Remove user from clinic
router.post('/:id/remove-user', async (req, res) => {
  try {
    if (!canAdministerClinic(req, Number(req.params.id))) {
      return res.status(403).json({ error: 'Clinic administrator access is required' });
    }
    const { userId } = req.body;
    const principal = getPrincipal(req)!;
    if (principal.kind === 'user' && Number(userId) === principal.id) {
      return res.status(400).json({ error: 'The active clinic administrator cannot remove themselves' });
    }
    const result = await pool.query(
      `UPDATE users SET
         clinic_id=NULL,
         role=CASE WHEN role='admin' THEN 'doctor' ELSE role END,
         status=CASE WHEN role IN ('receptionist','compounder','nurse','pharmacist') THEN 'inactive' ELSE status END
       WHERE id=$1 AND clinic_id=$2
       RETURNING id, name, role`,
      [userId, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Clinic user not found' });
    res.json({ success: true, user: result.rows[0] });
  } catch (error) { sendServerError(res, 'CLINIC_USER_REMOVE_FAILED', 'Unable to remove the clinic user.', error); }
});

// Get audit logs (dynamic compilation of events)
router.get('/:id/audit-logs', async (req, res) => {
  try {
    if (!canAdministerClinic(req, Number(req.params.id))) {
      return res.status(403).json({ error: 'Clinic administrator access is required' });
    }
    const r = await pool.query(`
      SELECT 'User Registration' as action, u.name as actor, u.role as role, 'Platform' as entity, 'Registered on platform' as sub, u.created_at as time
      FROM users u WHERE u.clinic_id=$1
      UNION ALL
      SELECT 'Patient Registration' as action, 'Reception' as actor, 'Staff' as role, CONCAT(p.first_name, ' ', p.last_name) as entity, 'Patient created' as sub, p.created_at as time
      FROM patients p WHERE p.clinic_id=$1
      UNION ALL
      SELECT 'Appointment Scheduled' as action, 'Reception' as actor, 'Staff' as role, CONCAT(p.first_name, ' ', p.last_name) as entity, a.status as sub, a.created_at as time
      FROM appointments a JOIN patients p ON p.id = a.patient_id WHERE a.clinic_id=$1
      UNION ALL
      SELECT 'Encounter Finalized' as action, u.name as actor, u.role as role, CONCAT(p.first_name, ' ', p.last_name) as entity, 'Prescription Generated' as sub, e.started_at as time
      FROM encounters e JOIN patients p ON p.id = e.patient_id JOIN users u ON u.id = e.doctor_id WHERE e.clinic_id=$1
      ORDER BY time DESC LIMIT 50
    `, [req.params.id]);
    res.json({ logs: r.rows });
  } catch (error) { sendServerError(res, 'CLINIC_AUDIT_READ_FAILED', 'Unable to load audit events.', error); }
});

// Join a clinic (request or direct assign)
router.post('/join', async (req, res) => {
  res.status(403).json({ error: 'Clinic membership requires an approved join request' });
});

// Get clinic stats
router.get('/:id/stats', async (req, res) => {
  try {
    if (!canAdministerClinic(req, Number(req.params.id))) {
      return res.status(403).json({ error: 'Clinic administrator access is required' });
    }
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
  } catch (error) { sendServerError(res, 'CLINIC_STATS_READ_FAILED', 'Unable to load clinic statistics.', error); }
});

export default router;
