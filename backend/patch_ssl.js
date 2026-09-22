const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules')) {
                results = results.concat(walk(file));
            }
        } else if (file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('.');
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    if (content.includes('ssl: { rejectUnauthorized: false }')) {
        content = content.replace(/ssl: \{ rejectUnauthorized: false \}/g, "ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }");
        fs.writeFileSync(f, content);
    }
});
