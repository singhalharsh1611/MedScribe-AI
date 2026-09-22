import { Pool } from 'pg';
import 'dotenv/config';
import { backfillDrugSearchIndex, ensureDrugSearchSchema } from '../services/drug-search-index.service';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
});

async function migrate() {
    try {
        console.log('[Drug Search] Creating additive search tables and indexes...');
        await ensureDrugSearchSchema(pool);
        const indexed = await backfillDrugSearchIndex(pool);
        const stats = await pool.query(`
            SELECT
                COUNT(*)::int AS indexed,
                COUNT(*) FILTER (WHERE dosage_form IS NOT NULL)::int AS with_form,
                COUNT(*) FILTER (WHERE jsonb_array_length(strength_components) > 0)::int AS with_strength,
                COUNT(*) FILTER (WHERE cardinality(qualifiers) > 0)::int AS with_qualifiers
            FROM drug_search_index
        `);
        console.log(`[Drug Search] Backfilled ${indexed} changed rows.`);
        console.log('[Drug Search] Index statistics:', stats.rows[0]);
    } finally {
        await pool.end();
    }
}

migrate().catch((error) => {
    console.error('[Drug Search] Migration failed:', error);
    process.exitCode = 1;
});
