import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

const initDb = async () => {
  try {
    console.log('Initializing database tables...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clinics (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        phone VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20),
        specialty VARCHAR(255),
        npi VARCHAR(50),
        pin VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'doctor',
        clinic_id INTEGER REFERENCES clinics(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        dob DATE,
        gender VARCHAR(20),
        phone VARCHAR(50),
        email VARCHAR(255),
        blood_group VARCHAR(10),
        uhid VARCHAR(100) UNIQUE,
        clinic_id INTEGER REFERENCES clinics(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patients(id),
        clinic_id INTEGER REFERENCES clinics(id),
        doctor_id INTEGER REFERENCES users(id),
        appointment_time TIMESTAMP NOT NULL,
        status VARCHAR(50) DEFAULT 'scheduled',
        reason_for_visit TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

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

      CREATE TABLE IF NOT EXISTS usage (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        duration_seconds DOUBLE PRECISION,
        cost_inr DOUBLE PRECISION,
        transcription_text TEXT,
        audio_url TEXT
      );

      CREATE TABLE IF NOT EXISTS translation_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        source_language TEXT,
        target_language TEXT,
        text_length INTEGER,
        translation_time_ms DOUBLE PRECISION,
        cost_inr DOUBLE PRECISION
      );

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

    console.log('Tables created successfully.');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    await pool.end();
  }
};

initDb();
