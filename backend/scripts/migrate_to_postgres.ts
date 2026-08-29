import { Client } from 'pg';
import Database from 'better-sqlite3';
import path from 'path';
import 'dotenv/config';

const dbDir = path.resolve(__dirname, '..', 'databases');

async function migrate() {
  const pgClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await pgClient.connect();
  console.log('Connected to Neon Postgres');

  // 1. Create tables
  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS usage (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      duration_seconds REAL,
      cost_inr REAL,
      transcription_text TEXT
    );

    CREATE TABLE IF NOT EXISTS translation_logs (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      source_language TEXT,
      target_language TEXT,
      text_length INTEGER,
      translation_time_ms REAL
    );

    CREATE TABLE IF NOT EXISTS prescriptions (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      patient_name TEXT,
      diagnosis TEXT,
      html_content TEXT
    );

    CREATE TABLE IF NOT EXISTS drugs (
      id SERIAL PRIMARY KEY,
      brand_name TEXT,
      company_name TEXT,
      salt TEXT,
      phonetic_code TEXT,
      price REAL,
      form TEXT,
      unit TEXT,
      url TEXT
    );
  `);
  console.log('Tables created');

  // Migrate Usage
  const usageDb = new Database(path.join(dbDir, 'usage.db'));
  const usages = usageDb.prepare('SELECT * FROM usage').all();
  for (const u of usages as any[]) {
    await pgClient.query(
      'INSERT INTO usage (timestamp, duration_seconds, cost_inr, transcription_text) VALUES ($1, $2, $3, $4)',
      [u.timestamp, u.duration_seconds, u.cost_inr, u.transcription_text]
    );
  }
  
  const translations = usageDb.prepare('SELECT * FROM translation_logs').all();
  for (const t of translations as any[]) {
    await pgClient.query(
      'INSERT INTO translation_logs (timestamp, source_language, target_language, text_length, translation_time_ms) VALUES ($1, $2, $3, $4, $5)',
      [t.timestamp, t.source_language, t.target_language, t.text_length, t.translation_time_ms]
    );
  }
  console.log(`Migrated ${usages.length} usages, ${translations.length} translation logs`);

  // Migrate Prescriptions
  const historyDb = new Database(path.join(dbDir, 'history.db'));
  const prescriptions = historyDb.prepare('SELECT * FROM prescriptions').all();
  for (const p of prescriptions as any[]) {
    await pgClient.query(
      'INSERT INTO prescriptions (timestamp, patient_name, diagnosis, html_content) VALUES ($1, $2, $3, $4)',
      [p.timestamp, p.patient_name, p.diagnosis, p.html_content]
    );
  }
  console.log(`Migrated ${prescriptions.length} prescriptions`);

  // Migrate Drugs (BATCHED)
  const drugsDb = new Database(path.join(dbDir, 'drugs.sqlite'));
  const drugs = drugsDb.prepare('SELECT * FROM drugs').all();
  console.log(`Found ${drugs.length} drugs to migrate... this will take a while.`);
  
  const batchSize = 1000;
  for (let i = 0; i < drugs.length; i += batchSize) {
    const batch = drugs.slice(i, i + batchSize) as any[];
    
    // Construct bulk insert query
    const values = [];
    const params = [];
    let paramIndex = 1;
    
    for (const d of batch) {
      values.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
      params.push(d.brand_name, d.company_name, d.salt, d.phonetic_code, d.price, d.form, d.unit, d.url);
    }
    
    if (values.length > 0) {
      const query = `INSERT INTO drugs (brand_name, company_name, salt, phonetic_code, price, form, unit, url) VALUES ${values.join(', ')}`;
      await pgClient.query(query, params);
    }
    
    if (i % 10000 === 0) {
      console.log(`Migrated ${i} drugs...`);
    }
  }

  // Create Trigram extension and index
  await pgClient.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
  await pgClient.query(`CREATE INDEX IF NOT EXISTS trgm_idx_drugs_brand_name ON drugs USING gin (brand_name gin_trgm_ops);`);
  console.log(`Migrated all drugs and created indices!`);

  await pgClient.end();
}

migrate().catch(console.error);
