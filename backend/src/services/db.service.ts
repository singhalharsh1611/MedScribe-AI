import { Pool } from 'pg';
import 'dotenv/config';

// Create new database connections
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Failed to connect to Neon Postgres:', err);
  } else {
    console.log('✅ Successfully connected to Neon Postgres Database!');
  }
});

export const logUsage = async (durationSeconds: number, transcriptionText: string) => {
  // Sarvam STT Streaming API pricing: ₹30.00 per hour
  const costInr = (durationSeconds / 3600) * 30.00;
  
  const query = `
    INSERT INTO usage (duration_seconds, cost_inr, transcription_text, timestamp) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING id
  `;
  
  const result = await pool.query(query, [durationSeconds, costInr, transcriptionText]);
  return { id: result.rows[0].id, costInr };
};

export const logTranslation = async (sourceLanguage: string, targetLanguage: string, textLength: number, translationTimeMs: number) => {
  const costInr = (textLength / 1000) * 2.00;
  const query = `
    INSERT INTO translation_logs (source_language, target_language, text_length, translation_time_ms, timestamp, cost_inr) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5) RETURNING id
  `;
  
  const result = await pool.query(query, [sourceLanguage, targetLanguage, textLength, translationTimeMs, costInr]);
  return result.rows[0].id;
};

export const getUsageStats = async () => {
  const usageResult = await pool.query(`SELECT id, duration_seconds, cost_inr, transcription_text, timestamp FROM usage ORDER BY timestamp DESC LIMIT 50`);
  const translationResult = await pool.query(`SELECT id, source_language, target_language, text_length, translation_time_ms, timestamp, cost_inr FROM translation_logs ORDER BY timestamp DESC LIMIT 50`);
  
  return {
    transcriptions: usageResult.rows,
    translations: translationResult.rows
  };
};

export const savePrescription = async (patientName: string, diagnosis: string, htmlContent: string, transcriptionText: string = '') => {
  const query = `
    INSERT INTO prescriptions (patient_name, diagnosis, html_content, transcription_text, timestamp) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING id
  `;
  
  const result = await pool.query(query, [patientName || 'Unknown Patient', diagnosis || 'Unknown Diagnosis', htmlContent, transcriptionText]);
  return result.rows[0].id;
};

export const getPrescriptions = async () => {
  // Return without html_content for the list view to save bandwidth
  const query = `SELECT id, timestamp, patient_name, diagnosis FROM prescriptions ORDER BY timestamp DESC`;
  const result = await pool.query(query);
  return result.rows;
};

export const getPrescriptionById = async (id: number) => {
  const query = `SELECT id, patient_name, diagnosis, html_content, transcription_text, timestamp FROM prescriptions WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export default pool;





