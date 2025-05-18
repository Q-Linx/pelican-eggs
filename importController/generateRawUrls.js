const fs = require('fs');
const path = require('path');

const GITHUB_USER = 'Q-Linx';
const GITHUB_REPO = 'pelican-eggs';
const BRANCH = 'main';

const basePath = path.resolve(__dirname, '..'); // root des Repos
const startFolder = path.join(basePath, 'eggs', 'default');
const rawBaseUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${BRANCH}/eggs/default`;

const grouped = {}; // { 'minecraft/java': [url1, url2], ... }

function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(fullPath);
        } else if (entry.name.endsWith('.json')) {
            const relativePath = path.relative(startFolder, fullPath).replace(/\\/g, '/');
            const rawUrl = `${rawBaseUrl}/${relativePath}`;

            const group = path.dirname(relativePath); // z. B. 'minecraft/java'
            if (!grouped[group]) grouped[group] = [];
            grouped[group].push(rawUrl);
        }
    }
}

walk(startFolder);

// Gruppiert ausgeben
const lines = [];
for (const group of Object.keys(grouped).sort()) {
    lines.push(`## ${group}`);
    lines.push(...grouped[group]);
    lines.push('');
}

const outputPath = path.join(basePath, 'RAW_URLS.md');
fs.writeFileSync(outputPath, lines.join('\n'));

console.log(`✅ RAW_URLS.md mit ${lines.length} Zeilen generiert (nach Ordnern gruppiert).`);
