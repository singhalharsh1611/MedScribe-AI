import type { Pool, PoolClient } from 'pg';
import { parseDrugIdentity } from './drug-matching.service';

type Queryable = Pick<Pool | PoolClient, 'query'>;

export async function ensureDrugSearchSchema(database: Queryable) {
    await database.query(`
        CREATE TABLE IF NOT EXISTS drug_search_index (
            drug_id INTEGER PRIMARY KEY REFERENCES drugs(id) ON DELETE CASCADE,
            brand_name_snapshot TEXT NOT NULL,
            normalized_name TEXT NOT NULL,
            compact_name TEXT NOT NULL,
            compact_identity TEXT NOT NULL,
            brand_root TEXT NOT NULL,
            dosage_form VARCHAR(30),
            release_types TEXT[] NOT NULL DEFAULT '{}',
            qualifiers TEXT[] NOT NULL DEFAULT '{}',
            strength_components JSONB NOT NULL DEFAULT '[]'::jsonb,
            phonetic_codes TEXT[] NOT NULL DEFAULT '{}',
            parse_status VARCHAR(40) NOT NULL DEFAULT 'unparsed',
            parser_version INTEGER NOT NULL DEFAULT 1,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        ALTER TABLE drug_search_index ADD COLUMN IF NOT EXISTS parser_version INTEGER NOT NULL DEFAULT 1;

        CREATE TABLE IF NOT EXISTS drug_aliases (
            id BIGSERIAL PRIMARY KEY,
            drug_id INTEGER NOT NULL REFERENCES drugs(id) ON DELETE CASCADE,
            alias_text TEXT NOT NULL,
            normalized_alias TEXT NOT NULL,
            compact_alias TEXT NOT NULL,
            alias_type VARCHAR(40) NOT NULL DEFAULT 'manual',
            verified BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (drug_id, normalized_alias)
        );

        CREATE INDEX IF NOT EXISTS drug_search_brand_root_idx ON drug_search_index(brand_root);
        CREATE INDEX IF NOT EXISTS drug_search_compact_name_idx ON drug_search_index(compact_name);
        CREATE INDEX IF NOT EXISTS drug_search_compact_identity_idx ON drug_search_index(compact_identity);
        CREATE INDEX IF NOT EXISTS drug_search_form_idx ON drug_search_index(dosage_form);
        CREATE INDEX IF NOT EXISTS drug_aliases_normalized_idx ON drug_aliases(normalized_alias) WHERE verified = TRUE;
        CREATE INDEX IF NOT EXISTS drug_aliases_compact_idx ON drug_aliases(compact_alias) WHERE verified = TRUE;
        CREATE UNIQUE INDEX IF NOT EXISTS drug_aliases_verified_normalized_unique
            ON drug_aliases(normalized_alias) WHERE verified = TRUE;
        CREATE INDEX IF NOT EXISTS drug_search_qualifiers_idx ON drug_search_index USING GIN(qualifiers);
        CREATE INDEX IF NOT EXISTS drug_search_phonetic_idx ON drug_search_index USING GIN(phonetic_codes);
    `);

    try {
        await database.query('CREATE EXTENSION IF NOT EXISTS pg_trgm');
        await database.query(`
            CREATE INDEX IF NOT EXISTS drug_search_normalized_trgm_idx
                ON drug_search_index USING GIN(normalized_name gin_trgm_ops);
            CREATE INDEX IF NOT EXISTS drug_search_compact_trgm_idx
                ON drug_search_index USING GIN(compact_name gin_trgm_ops);
            CREATE INDEX IF NOT EXISTS drug_aliases_normalized_trgm_idx
                ON drug_aliases USING GIN(normalized_alias gin_trgm_ops);
        `);
    } catch (error) {
        console.warn('[Drug Search] pg_trgm indexes were not created:', error instanceof Error ? error.message : error);
    }
}

export async function backfillDrugSearchIndex(database: Queryable, batchSize = 750) {
    let lastId = 0;
    let indexed = 0;
    while (true) {
        const result = await database.query(`
            SELECT d.id, d.brand_name
            FROM drugs d
            LEFT JOIN drug_search_index search ON search.drug_id = d.id
            WHERE d.id > $1
              AND (
                search.drug_id IS NULL
                OR search.brand_name_snapshot IS DISTINCT FROM d.brand_name
                OR search.parser_version < 2
                OR (
                    search.parser_version < 3
                    AND d.brand_name ~* '\\m(gp|gm|mp)[[:space:]-]+[0-9]+\\M'
                )
              )
            ORDER BY d.id
            LIMIT $2
        `, [lastId, batchSize]);
        if (result.rows.length === 0) break;

        const values: unknown[] = [];
        const placeholders = result.rows.map((row, rowIndex) => {
            const parsed = parseDrugIdentity(row.brand_name);
            const offset = rowIndex * 13;
            values.push(
                row.id,
                row.brand_name,
                parsed.normalized_name,
                parsed.compact_name,
                parsed.compact_identity,
                parsed.brand_root,
                parsed.dosage_form === 'unknown' ? null : parsed.dosage_form,
                parsed.release_types,
                parsed.qualifiers,
                JSON.stringify(parsed.strength_components),
                parsed.phonetic_codes,
                parsed.parse_status,
                3,
            );
            return `(${Array.from({ length: 13 }, (_, index) => `$${offset + index + 1}`).join(', ')})`;
        });

        await database.query(`
            INSERT INTO drug_search_index (
                drug_id, brand_name_snapshot, normalized_name, compact_name, compact_identity,
                brand_root, dosage_form, release_types, qualifiers, strength_components,
                phonetic_codes, parse_status, parser_version
            ) VALUES ${placeholders.join(', ')}
            ON CONFLICT (drug_id) DO UPDATE SET
                brand_name_snapshot = EXCLUDED.brand_name_snapshot,
                normalized_name = EXCLUDED.normalized_name,
                compact_name = EXCLUDED.compact_name,
                compact_identity = EXCLUDED.compact_identity,
                brand_root = EXCLUDED.brand_root,
                dosage_form = EXCLUDED.dosage_form,
                release_types = EXCLUDED.release_types,
                qualifiers = EXCLUDED.qualifiers,
                strength_components = EXCLUDED.strength_components,
                phonetic_codes = EXCLUDED.phonetic_codes,
                parse_status = EXCLUDED.parse_status,
                parser_version = EXCLUDED.parser_version,
                updated_at = CURRENT_TIMESTAMP
        `, values);

        lastId = result.rows[result.rows.length - 1].id;
        indexed += result.rows.length;
        if (indexed % (batchSize * 20) === 0) console.log(`[Drug Search] Indexed ${indexed} drug rows...`);
    }
    return indexed;
}
