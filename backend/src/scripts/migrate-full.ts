import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const migrate = async () => {
  try {
    console.log('Running full schema migration...');

    // Extend users table
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'pending';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status VARCHAR(30) DEFAULT 'pending';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'doctor';
      ALTER TABLE users ALTER COLUMN pin TYPE VARCHAR(255);
    `);

    // Extend clinics table
    await pool.query(`
      ALTER TABLE clinics ADD COLUMN IF NOT EXISTS type VARCHAR(100);
      ALTER TABLE clinics ADD COLUMN IF NOT EXISTS email VARCHAR(255);
      ALTER TABLE clinics ADD COLUMN IF NOT EXISTS city VARCHAR(100);
      ALTER TABLE clinics ADD COLUMN IF NOT EXISTS state VARCHAR(50);
      ALTER TABLE clinics ADD COLUMN IF NOT EXISTS zip VARCHAR(20);
      ALTER TABLE clinics ADD COLUMN IF NOT EXISTS street VARCHAR(255);
      ALTER TABLE clinics ADD COLUMN IF NOT EXISTS admin_id INTEGER;
    `);

    // Extend patients table  
    await pool.query(`
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS complaint TEXT;
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'waiting';
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS doctor_id INTEGER;
    `);

    // Extend appointments table
    await pool.query(`
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT;
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS token VARCHAR(20);
    `);

    // Join requests table (doctor wants to join an existing clinic)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS join_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
        status VARCHAR(30) DEFAULT 'pending',
        message TEXT,
        reviewed_by INTEGER REFERENCES users(id),
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, clinic_id)
      );
    `);

    // Staff table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS staff (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'receptionist',
        status VARCHAR(30) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, clinic_id)
      );
    `);

    // Queue table (live patient queue per clinic)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS queue (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
        clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
        doctor_id INTEGER REFERENCES users(id),
        token VARCHAR(20),
        status VARCHAR(30) DEFAULT 'waiting',
        complaint TEXT,
        appointment_id INTEGER REFERENCES appointments(id),
        called_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Encounters / Consultations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS encounters (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patients(id),
        doctor_id INTEGER REFERENCES users(id),
        clinic_id INTEGER REFERENCES clinics(id),
        chief_complaint TEXT,
        diagnosis TEXT,
        prescription TEXT,
        notes TEXT,
        status VARCHAR(30) DEFAULT 'in_progress',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP
      );
    `);

    // System admin (super admin) table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS super_admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed super admin if not exists (username: admin, password: sleekcare2024)
    const salt = 'defaultsalt123456789012345678901';
    const crypto = await import('crypto');
    const hash = crypto.scryptSync('sleekcare2024', salt, 64).toString('hex');
    await pool.query(`
      INSERT INTO super_admins (username, password_hash)
      VALUES ('admin', $1)
      ON CONFLICT (username) DO NOTHING;
    `, [`${salt}:${hash}`]);

    console.log('Migration complete. Super admin seeded: admin / sleekcare2024');
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

migrate();
