import { Pool } from 'pg';
import 'dotenv/config';
import { backfillDrugSearchIndex, ensureDrugSearchSchema } from '../services/drug-search-index.service';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
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
      ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(30);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_reset_required BOOLEAN DEFAULT FALSE;
      ALTER TABLE users ALTER COLUMN pin TYPE VARCHAR(255);
      ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
    `);

    // Additive, rebuildable index for medication-name matching. The source drugs table is untouched.
    await ensureDrugSearchSchema(pool);
    await backfillDrugSearchIndex(pool);

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
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS address TEXT;
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255);
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact_relation VARCHAR(100);
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50);
    `);

    // Extend appointments table
    await pool.query(`
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT;
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS token VARCHAR(20);
    `);

    // Operational usage and model-cost telemetry
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usage (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        duration_seconds DOUBLE PRECISION,
        cost_inr DOUBLE PRECISION,
        transcription_text TEXT,
        audio_url TEXT
      );
      ALTER TABLE usage ADD COLUMN IF NOT EXISTS audio_url TEXT;

      CREATE TABLE IF NOT EXISTS translation_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        source_language TEXT,
        target_language TEXT,
        text_length INTEGER,
        translation_time_ms DOUBLE PRECISION,
        cost_inr DOUBLE PRECISION
      );
      ALTER TABLE translation_logs ADD COLUMN IF NOT EXISTS cost_inr DOUBLE PRECISION;

      CREATE TABLE IF NOT EXISTS medgemma_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        operation TEXT,
        prompt_tokens INTEGER,
        completion_tokens INTEGER,
        cost_usd DOUBLE PRECISION,
        context_text TEXT
      );
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
        vitals JSONB,
        called_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE queue ADD COLUMN IF NOT EXISTS vitals JSONB;
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
      ALTER TABLE encounters ADD COLUMN IF NOT EXISTS queue_id INTEGER REFERENCES queue(id);
      ALTER TABLE encounters ADD COLUMN IF NOT EXISTS prescription_id INTEGER;
      CREATE UNIQUE INDEX IF NOT EXISTS encounters_queue_id_idx
        ON encounters(queue_id) WHERE queue_id IS NOT NULL;
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

    // Scope saved prescription history to its clinic and author.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        patient_name TEXT,
        diagnosis TEXT,
        html_content TEXT,
        transcription_text TEXT,
        audio_url TEXT
      );
      ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS transcription_text TEXT;
      ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS audio_url TEXT;
      ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS clinic_id INTEGER REFERENCES clinics(id);
      ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
      ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS encounter_id INTEGER REFERENCES encounters(id);
      ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS patient_id INTEGER REFERENCES patients(id);
      ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS serial VARCHAR(40);
      ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS prescription_data JSONB;
      CREATE INDEX IF NOT EXISTS prescriptions_clinic_id_idx ON prescriptions(clinic_id);
      CREATE UNIQUE INDEX IF NOT EXISTS prescriptions_encounter_id_idx ON prescriptions(encounter_id);
      CREATE UNIQUE INDEX IF NOT EXISTS prescriptions_serial_idx ON prescriptions(serial) WHERE serial IS NOT NULL;
      DO $$ BEGIN
        ALTER TABLE encounters ADD CONSTRAINT encounters_prescription_id_fkey
          FOREIGN KEY (prescription_id) REFERENCES prescriptions(id);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    const adminUsername = process.env.SUPERADMIN_USERNAME;
    const adminPassword = process.env.SUPERADMIN_PASSWORD;
    if (adminUsername && adminPassword) {
      const crypto = await import('crypto');
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.scryptSync(adminPassword, salt, 64).toString('hex');
      await pool.query(`
        INSERT INTO super_admins (username, password_hash)
        VALUES ($1, $2)
        ON CONFLICT (username) DO NOTHING;
      `, [adminUsername, `${salt}:${hash}`]);
    }

    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

migrate();
