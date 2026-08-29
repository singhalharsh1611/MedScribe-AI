import axios from 'axios';
import * as cheerio from 'cheerio';
import { Pool } from 'pg';
import path from 'path';
import * as cliProgress from 'cli-progress';
import 'dotenv/config';

// Constants
const CONCURRENCY = 50; // Vastly increased concurrency for speed
const DELAY_MS = 100; // Minimal delay

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
};

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function getStats() {
    const res = await pool.query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN salt IS NOT NULL THEN 1 ELSE 0 END) as done,
            SUM(CASE WHEN salt IS NULL THEN 1 ELSE 0 END) as pending
        FROM drugs
    `);
    return res.rows[0];
}

function cleanBrandNameFromUrl(url: string): string {
    const parts = url.split('/');
    const slug = parts[parts.length - 1]; 
    let cleaned = slug.replace(/-[0-9]+$/, '');
    cleaned = cleaned.replace(/-/g, ' ');
    return cleaned.replace(/\b\w/g, c => c.toUpperCase());
}

async function fetchSitemap(sitemapUrl: string) {
    console.log(`\nFetching child sitemap: ${sitemapUrl}`);
    try {
        const { data } = await axios.get(sitemapUrl, { headers: HEADERS });
        const $ = cheerio.load(data, { xmlMode: true });
        
        const urls: string[] = [];
        $('loc').each((_, el) => {
            const url = $(el).text();
            if (url.includes('/drugs/')) {
                urls.push(url);
            }
        });

        // Batch insert
        let count = 0;
        const batchSize = 1000;
        for (let i = 0; i < urls.length; i += batchSize) {
            const batch = urls.slice(i, i + batchSize);
            const values = [];
            const params = [];
            let paramIdx = 1;
            
            for (const url of batch) {
                const brand = cleanBrandNameFromUrl(url);
                values.push(`($${paramIdx++}, $${paramIdx++})`);
                params.push(url, brand);
            }
            
            if (values.length > 0) {
                const query = `INSERT INTO drugs (url, brand_name) VALUES ${values.join(', ')} ON CONFLICT (url) DO NOTHING`;
                const res = await pool.query(query, params);
                count += res.rowCount || 0;
            }
        }

        console.log(`✅ Added ${count} new drugs from ${sitemapUrl.split('/').pop()}.`);
    } catch (error: any) {
        console.error(`❌ Failed to fetch child sitemap ${sitemapUrl}: ${error.message}`);
    }
}

async function fetchAllSitemaps() {
    console.log(`\nFetching master sitemap to discover all drug sitemaps...`);
    try {
        const { data } = await axios.get('https://www.1mg.com/sitemap.xml', { headers: HEADERS });
        const $ = cheerio.load(data, { xmlMode: true });
        
        const sitemaps: string[] = [];
        $('loc').each((_, el) => {
            const url = $(el).text();
            if (url.includes('sitemap_drugs_')) {
                sitemaps.push(url);
            }
        });

        console.log(`Found ${sitemaps.length} drug sitemaps. Downloading all URLs...`);
        
        for (const sitemapUrl of sitemaps) {
            await fetchSitemap(sitemapUrl);
        }
    } catch (error: any) {
        console.error(`❌ Failed to fetch master sitemap: ${error.message}`);
    }
}

async function scrapePage(url: string, brandName: string): Promise<{salt: string}> {
    try {
        const { data } = await axios.get(url, { headers: HEADERS, timeout: 10000 });
        const $ = cheerio.load(data);
        
        let salt = '';
        
        const keywords = $('meta[name="keywords"]').attr('content');
        if (keywords) {
            const parts = keywords.split(',');
            salt = parts[parts.length - 1].trim();
        }

        if (!salt || salt === 'Unknown') {
            const desc = $('meta[name="description"]').attr('content');
            if (desc && desc.includes('active ingredient')) {
                const match = desc.match(/active ingredients? (.*?)\./i);
                if (match) salt = match[1];
            }
        }

        if (!salt) salt = 'UNKNOWN_SALT';

        return { salt };
    } catch (error: any) {
        return { salt: 'ERROR_OR_404' };
    }
}

async function runScraper() {
    // Ensure table exists
    await pool.query(`
        CREATE TABLE IF NOT EXISTS drugs (
            id SERIAL PRIMARY KEY,
            brand_name TEXT,
            company_name TEXT,
            salt TEXT,
            phonetic_code TEXT,
            price REAL,
            form TEXT,
            unit TEXT,
            url TEXT UNIQUE
        );
    `);

    const stats = await getStats();
    console.log(`\n📊 Database Stats:`);
    console.log(`   Total:   ${stats.total}`);
    console.log(`   Pending: ${stats.pending}`);
    console.log(`   Done:    ${stats.done}`);

    if (parseInt(stats.total) === 0) {
        console.log(`\n⚠️ Database is empty. Fetching all sitemaps...`);
        await fetchAllSitemaps();
    }

    const newStats = await getStats();
    if (parseInt(newStats.pending) === 0) {
        console.log(`\n✅ No pending URLs to scrape!`);
        await pool.end();
        return;
    }

    console.log(`\n🚀 Starting scraper with concurrency ${CONCURRENCY}... (Delay: ${DELAY_MS}ms)`);
    
    const progressBar = new cliProgress.SingleBar({
        format: 'Scraping | {bar} | {percentage}% | ETA: {eta_formatted} | Elapsed: {duration_formatted} | {value}/{total} | Last: {lastBrand}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true,
        etaBuffer: 50
    });

    progressBar.start(parseInt(newStats.pending), 0, { lastBrand: 'N/A' });

    let processed = 0;
    let keepRunning = true;

    process.on('SIGINT', () => {
        console.log('\n\n🛑 Received SIGINT (Ctrl+C). Shutting down gracefully...');
        keepRunning = false;
    });

    while (keepRunning) {
        const batchRes = await pool.query('SELECT url, brand_name FROM drugs WHERE salt IS NULL LIMIT $1', [CONCURRENCY]);
        const batch = batchRes.rows;
        if (batch.length === 0) break;

        const promises = batch.map(async (row) => {
            const { salt } = await scrapePage(row.url, row.brand_name);
            await pool.query('UPDATE drugs SET salt = $1 WHERE url = $2', [salt, row.url]);
            
            processed++;
            progressBar.update(processed, { lastBrand: row.brand_name });
        });

        await Promise.all(promises);

        if (keepRunning) {
            await new Promise(r => setTimeout(r, DELAY_MS));
        }
    }

    progressBar.stop();
    console.log('\n⏹️ Scraper stopped.');
    
    const finalStats = await getStats();
    console.log(`\n📊 Final Database Stats:`);
    console.log(`   Done:    ${finalStats.done}`);
    await pool.end();
}

runScraper().catch(console.error);
