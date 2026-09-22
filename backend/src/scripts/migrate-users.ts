import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

const migrate = async () => {
  try {
    console.log('Running migrations...');

    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS specialty VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS npi VARCHAR(50);
    `);

    // Widen pin column in case it's too short for bcrypt hashes
    await pool.query(`ALTER TABLE users ALTER COLUMN pin TYPE VARCHAR(255);`);

    console.log('Migrations complete.');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await pool.end();
  }
};

migrate();
