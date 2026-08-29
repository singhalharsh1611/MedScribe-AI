import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure databases directory exists
const dbDir = path.resolve(__dirname, '../../databases');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create new database connections
const usageDb = new Database(path.join(dbDir, 'usage.db'));
const historyDb = new Database(path.join(dbDir, 'history.db'));

// Initialize tables
usageDb.exec(`
  CREATE TABLE IF NOT EXISTS usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    duration_seconds REAL,
    cost_inr REAL,
    transcription_text TEXT
  );

  CREATE TABLE IF NOT EXISTS translation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    source_language TEXT,
    target_language TEXT,
    text_length INTEGER,
    translation_time_ms REAL
  );
`);

historyDb.exec(`
  CREATE TABLE IF NOT EXISTS prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    patient_name TEXT,
    diagnosis TEXT,
    html_content TEXT
  );
`);

export const logUsage = (durationSeconds: number, transcriptionText: string) => {
  // Sarvam API pricing: ₹130.00 per hour
  const costInr = (durationSeconds / 3600) * 30.00;
  
  const stmt = usageDb.prepare(`
    INSERT INTO usage (duration_seconds, cost_inr, transcription_text, timestamp)
    VALUES (?, ?, ?, DATETIME('now', '+5 hours', '+30 minutes'))
  `);
  
  const result = stmt.run(durationSeconds, costInr, transcriptionText);
  return { id: result.lastInsertRowid, costInr };
};

export const logTranslation = (sourceLanguage: string, targetLanguage: string, textLength: number, translationTimeMs: number) => {
  const stmt = usageDb.prepare(`
    INSERT INTO translation_logs (source_language, target_language, text_length, translation_time_ms, timestamp)
    VALUES (?, ?, ?, ?, DATETIME('now', '+5 hours', '+30 minutes'))
  `);
  
  const result = stmt.run(sourceLanguage, targetLanguage, textLength, translationTimeMs);
  return result.lastInsertRowid;
};

export const getUsageStats = () => {
  const usageStmt = usageDb.prepare(`SELECT * FROM usage ORDER BY timestamp DESC LIMIT 50`);
  const translationStmt = usageDb.prepare(`SELECT * FROM translation_logs ORDER BY timestamp DESC LIMIT 50`);
  
  return {
    transcriptions: usageStmt.all(),
    translations: translationStmt.all()
  };
};

export const savePrescription = (patientName: string, diagnosis: string, htmlContent: string) => {
  const stmt = historyDb.prepare(`
    INSERT INTO prescriptions (patient_name, diagnosis, html_content, timestamp)
    VALUES (?, ?, ?, DATETIME('now', '+5 hours', '+30 minutes'))
  `);
  
  const result = stmt.run(patientName || 'Unknown Patient', diagnosis || 'Unknown Diagnosis', htmlContent);
  return result.lastInsertRowid;
};

export const getPrescriptions = () => {
  // Return without html_content for the list view to save bandwidth
  const stmt = historyDb.prepare(`SELECT id, timestamp, patient_name, diagnosis FROM prescriptions ORDER BY timestamp DESC`);
  return stmt.all();
};

export const getPrescriptionById = (id: number) => {
  const stmt = historyDb.prepare(`SELECT * FROM prescriptions WHERE id = ?`);
  return stmt.get(id);
};
