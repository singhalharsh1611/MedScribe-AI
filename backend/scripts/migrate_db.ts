import Database from 'better-sqlite3';
import path from 'path';
import { doubleMetaphone } from 'double-metaphone';
import cliProgress from 'cli-progress';

const DB_PATH = path.join(__dirname, '..', 'assets', 'drugs.sqlite');
const db = new Database(DB_PATH);

console.log('Starting Database Migration for Lightning Fast Searches...');

// 1. Add phonetic column if it doesn't exist
try {
    db.exec(`ALTER TABLE drugs ADD COLUMN phonetic_code TEXT`);
    console.log('✅ Added phonetic_code column.');
} catch (e: any) {
    if (e.message.includes('duplicate column name')) {
        console.log('ℹ️ phonetic_code column already exists.');
    } else {
        throw e;
    }
}

// 2. Calculate phonetic codes for all rows where it is null
const rows = db.prepare('SELECT url, brand_name FROM drugs WHERE phonetic_code IS NULL').all() as any[];

if (rows.length > 0) {
    console.log(`Calculating phonetic codes for ${rows.length} drugs...`);
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(rows.length, 0);

    const updateStmt = db.prepare('UPDATE drugs SET phonetic_code = ? WHERE url = ?');
    
    // Batch update in a transaction for extreme speed
    const updateMany = db.transaction((drugs: any[]) => {
        for (const drug of drugs) {
            const [primary] = doubleMetaphone(drug.brand_name.split(' ')[0] || drug.brand_name);
            updateStmt.run(primary, drug.url);
        }
    });

    // Update in chunks to update progress bar
    const chunkSize = 5000;
    for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        updateMany(chunk);
        progressBar.update(i + chunk.length);
    }
    
    progressBar.stop();
    console.log('✅ Phonetic codes successfully pre-computed and saved to DB!');
} else {
    console.log('✅ All phonetic codes are already computed.');
}

// 3. Create FTS5 Trigram Index for Lightning Fast Fuzzy Searching
console.log('Creating FTS5 Trigram Virtual Table...');
db.exec(`
    DROP TABLE IF EXISTS drugs_fts;
    CREATE VIRTUAL TABLE drugs_fts USING fts5(
        brand_name,
        url UNINDEXED,
        tokenize='trigram'
    );
`);

console.log('Populating FTS5 index (This may take a minute)...');
db.exec(`
    INSERT INTO drugs_fts (brand_name, url)
    SELECT brand_name, url FROM drugs;
`);

console.log('✅ FTS5 Trigram Index fully built!');
console.log('🎉 Migration Complete! You can now use pure SQLite for instant searches.');
