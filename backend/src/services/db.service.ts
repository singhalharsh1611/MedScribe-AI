import Database from 'better-sqlite3';
import path from 'path';

// Create a new database file in the project root
const dbPath = path.resolve(__dirname, '../../usage.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
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

export const logUsage = (durationSeconds: number, transcriptionText: string) => {
  // Sarvam API pricing: ₹30.00 per hour
  const costInr = (durationSeconds / 3600) * 30.00;
  
  const stmt = db.prepare(`
    INSERT INTO usage (duration_seconds, cost_inr, transcription_text, timestamp)
    VALUES (?, ?, ?, DATETIME('now', '+5 hours', '+30 minutes'))
  `);
  
  const result = stmt.run(durationSeconds, costInr, transcriptionText);
  return { id: result.lastInsertRowid, costInr };
};

export const logTranslation = (sourceLanguage: string, targetLanguage: string, textLength: number, translationTimeMs: number) => {
  const stmt = db.prepare(`
    INSERT INTO translation_logs (source_language, target_language, text_length, translation_time_ms, timestamp)
    VALUES (?, ?, ?, ?, DATETIME('now', '+5 hours', '+30 minutes'))
  `);
  
  const result = stmt.run(sourceLanguage, targetLanguage, textLength, translationTimeMs);
  return result.lastInsertRowid;
};

export const getUsageStats = () => {
  const usageStmt = db.prepare(`SELECT * FROM usage ORDER BY timestamp DESC LIMIT 50`);
  const translationStmt = db.prepare(`SELECT * FROM translation_logs ORDER BY timestamp DESC LIMIT 50`);
  
  return {
    transcriptions: usageStmt.all(),
    translations: translationStmt.all()
  };
};
