const fs = require('fs');
const path = require('path');

const GITHUB_USER = 'Q-Linx';
const GITHUB_REPO = 'pelican-eggs';
const BRANCH = 'main';

const basePath = path.resolve(__dirname, '..'); // root des Repos
const startFolder = path.join(basePath, 'eggs', 'default');
const rawBaseUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${BRANCH}/eggs/default`;

const result = [];

function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(fullPath);
        } else if (entry.name.endsWith('.json')) {
            const relativePath = path.relative(startFolder, fullPath).replace(/\\/g, '/');
            const rawUrl = `${rawBaseUrl}/${relativePath}`;
            result.push(rawUrl);
        }
    }
}

walk(startFolder);

const outputPath = path.join(basePath, 'RAW_URLS.md');
fs.writeFileSync(outputPath, result.join('\n') + '\n');

console.log(`✅ RAW_URLS.md mit ${result.length} Einträgen generiert.`);
