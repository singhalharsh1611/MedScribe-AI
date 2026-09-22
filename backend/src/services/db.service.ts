import { Pool } from 'pg';
import 'dotenv/config';

// Create new database connections
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Failed to connect to Postgres:', err);
  } else {
    console.log('✅ Successfully connected to Postgres Database!');
  }
});

export const logUsage = async (durationSeconds: number, transcriptionText: string, audioUrl: string | null = null) => {
  // Sarvam STT Streaming API pricing: ₹30.00 per hour
  const costInr = (durationSeconds / 3600) * 30.00;
  
  const query = `
    INSERT INTO usage (duration_seconds, cost_inr, transcription_text, timestamp, audio_url) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4) RETURNING id
  `;
  
  const result = await pool.query(query, [durationSeconds, costInr, transcriptionText, audioUrl]);
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

export const logMedGemmaUsage = async (operation: string, promptTokens: number, completionTokens: number, costUsd: number, contextText: string = '') => {
  const query = `
    INSERT INTO medgemma_logs (operation, prompt_tokens, completion_tokens, cost_usd, context_text, timestamp) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING id
  `;
  const result = await pool.query(query, [operation, promptTokens, completionTokens, costUsd, contextText]);
  return result.rows[0].id;
};

export const getUsageStats = async () => {
  const usageResult = await pool.query(`SELECT id, duration_seconds, cost_inr, transcription_text, timestamp, audio_url FROM usage ORDER BY timestamp DESC LIMIT 50`);
  const translationResult = await pool.query(`SELECT id, source_language, target_language, text_length, translation_time_ms, timestamp, cost_inr FROM translation_logs ORDER BY timestamp DESC LIMIT 50`);
  const medgemmaResult = await pool.query(`SELECT id, operation, prompt_tokens, completion_tokens, cost_usd, context_text, timestamp FROM medgemma_logs ORDER BY timestamp DESC LIMIT 50`);
  
  return {
    transcriptions: usageResult.rows,
    translations: translationResult.rows,
    medgemma: medgemmaResult.rows
  };
};

export const savePrescription = async (
  patientName: string,
  diagnosis: string,
  htmlContent: string,
  transcriptionText: string = '',
  audioUrl: string | null = null,
  clinicId: number,
  userId: number
) => {
  const query = `
    INSERT INTO prescriptions (patient_name, diagnosis, html_content, transcription_text, timestamp, audio_url, clinic_id, user_id)
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, $6, $7) RETURNING id
  `;
  
  const result = await pool.query(query, [patientName || 'Unknown Patient', diagnosis || 'Unknown Diagnosis', htmlContent, transcriptionText, audioUrl, clinicId, userId]);
  return result.rows[0].id;
};

export const getPrescriptions = async (clinicId: number) => {
  // Return without html_content for the list view to save bandwidth
  const query = `SELECT id, timestamp, patient_name, diagnosis, transcription_text, audio_url
                 FROM prescriptions WHERE clinic_id=$1 ORDER BY timestamp DESC`;
  const result = await pool.query(query, [clinicId]);
  return result.rows;
};

export const getPrescriptionById = async (id: number, clinicId: number) => {
  const query = `
    SELECT pr.id, pr.encounter_id, pr.patient_id, pr.serial, pr.patient_name,
           pr.diagnosis, pr.html_content, pr.transcription_text, pr.audio_url,
           pr.prescription_data, pr.timestamp,
           p.first_name, p.last_name,
           EXTRACT(YEAR FROM age(CURRENT_DATE, p.dob))::integer AS age,
           p.dob, p.gender, p.phone, p.email, p.uhid, NULL::text AS allergies,
           u.name AS clinician_name, u.specialty AS clinician_specialty, u.npi AS clinician_npi
      FROM prescriptions pr
      LEFT JOIN patients p ON p.id = pr.patient_id AND p.clinic_id = pr.clinic_id
      LEFT JOIN users u ON u.id = pr.user_id
     WHERE pr.id=$1 AND pr.clinic_id=$2`;
  const result = await pool.query(query, [id, clinicId]);
  return result.rows[0];
};

export default pool;





