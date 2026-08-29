import axios from 'axios';
import * as cheerio from 'cheerio';
import Database from 'better-sqlite3';
import path from 'path';
import * as cliProgress from 'cli-progress';
import fs from 'fs';

// Constants
const DB_PATH = path.join(__dirname, '..', 'databases', 'drugs.sqlite');
const CONCURRENCY = 50; // Vastly increased concurrency for speed
const DELAY_MS = 100; // Minimal delay

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
};

// Ensure assets directory exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

// Initialize Database
const db = new Database(DB_PATH);
db.exec(`
    CREATE TABLE IF NOT EXISTS drugs (
        url TEXT PRIMARY KEY,
        brand_name TEXT,
        salt TEXT,
        status TEXT DEFAULT 'PENDING' -- PENDING, DONE, ERROR, 404
    );
`);

const insertDrugStmt = db.prepare(`
    INSERT OR IGNORE INTO drugs (url, brand_name, status) VALUES (?, ?, 'PENDING')
`);

const updateDrugStmt = db.prepare(`
    UPDATE drugs SET salt = ?, status = ? WHERE url = ?
`);

const getPendingStmt = db.prepare(`
    SELECT url, brand_name FROM drugs WHERE status = 'PENDING' LIMIT ?
`);

const getStatsStmt = db.prepare(`
    SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'DONE' THEN 1 ELSE 0 END) as done,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'ERROR' THEN 1 ELSE 0 END) as error,
        SUM(CASE WHEN status = '404' THEN 1 ELSE 0 END) as not_found
    FROM drugs
`);

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
        
        let count = 0;
        const insertMany = db.transaction((urls: string[]) => {
            for (const url of urls) {
                const brand = cleanBrandNameFromUrl(url);
                const info = insertDrugStmt.run(url, brand);
                if (info.changes > 0) count++;
            }
        });

        const urls: string[] = [];
        $('loc').each((_, el) => {
            const url = $(el).text();
            if (url.includes('/drugs/')) {
                urls.push(url);
            }
        });

        insertMany(urls);
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
        
        // Fetch them sequentially to avoid blowing up memory and getting IP blocked
        for (const sitemapUrl of sitemaps) {
            await fetchSitemap(sitemapUrl);
        }
    } catch (error: any) {
        console.error(`❌ Failed to fetch master sitemap: ${error.message}`);
    }
}

async function scrapePage(url: string, brandName: string): Promise<{salt: string, status: string}> {
    try {
        const { data } = await axios.get(url, { headers: HEADERS, timeout: 10000 });
        const $ = cheerio.load(data);
        
        let salt = '';
        
        // 1mg places the generic salt in the meta keywords tag (usually the last comma-separated item)
        const keywords = $('meta[name="keywords"]').attr('content');
        if (keywords) {
            const parts = keywords.split(',');
            // The salt is usually the very last item
            salt = parts[parts.length - 1].trim();
        }

        if (!salt || salt === 'Unknown') {
            // Fallback to checking description
            const desc = $('meta[name="description"]').attr('content');
            if (desc && desc.includes('active ingredient')) {
                const match = desc.match(/active ingredients? (.*?)\./i);
                if (match) salt = match[1];
            }
        }

        if (!salt) {
            salt = 'UNKNOWN_SALT';
        }

        return { salt, status: 'DONE' };
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return { salt: '', status: '404' };
        }
        return { salt: '', status: 'ERROR' };
    }
}

async function runScraper() {
    const stats = getStatsStmt.get() as any;
    console.log(`\n📊 Database Stats:`);
    console.log(`   Total:   ${stats.total}`);
    console.log(`   Pending: ${stats.pending}`);
    console.log(`   Done:    ${stats.done}`);
    console.log(`   Errors:  ${stats.error} (Will be retried)`);

    if (stats.total === 0) {
        console.log(`\n⚠️ Database is empty. Fetching all sitemaps...`);
        await fetchAllSitemaps();
    } else if (stats.error > 0) {
        // Reset errors to pending to retry them
        console.log(`\n♻️ Resetting ${stats.error} errors to PENDING for retry...`);
        db.exec("UPDATE drugs SET status = 'PENDING' WHERE status = 'ERROR'");
    }

    const newStats = getStatsStmt.get() as any;
    if (newStats.pending === 0) {
        console.log(`\n✅ No pending URLs to scrape!`);
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

    progressBar.start(newStats.pending, 0, { lastBrand: 'N/A' });

    let processed = 0;
    let keepRunning = true;

    // Graceful shutdown on Ctrl+C
    process.on('SIGINT', () => {
        console.log('\n\n🛑 Received SIGINT (Ctrl+C). Shutting down gracefully...');
        keepRunning = false;
    });

    while (keepRunning) {
        const batch = getPendingStmt.all(CONCURRENCY) as {url: string, brand_name: string}[];
        if (batch.length === 0) break; // We are done!

        // Scrape in parallel up to CONCURRENCY limit
        const promises = batch.map(async (row) => {
            const { salt, status } = await scrapePage(row.url, row.brand_name);
            updateDrugStmt.run(salt, status, row.url);
            
            processed++;
            progressBar.update(processed, { lastBrand: row.brand_name });
        });

        await Promise.all(promises);

        // Sleep to avoid rate limits
        if (keepRunning) {
            await new Promise(r => setTimeout(r, DELAY_MS));
        }
    }

    progressBar.stop();
    console.log('\n🏁 Scraper stopped.');
    
    const finalStats = getStatsStmt.get() as any;
    console.log(`\n📊 Final Database Stats:`);
    console.log(`   Done:    ${finalStats.done}`);
    console.log(`   Errors:  ${finalStats.error}`);
}

runScraper().catch(console.error);
