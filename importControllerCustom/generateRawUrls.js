const fs = require('fs');
const path = require('path');

const GITHUB_USER = 'Q-Linx';
const GITHUB_REPO = 'pelican-eggs';
const BRANCH = 'main';

const repoRoot = path.resolve(__dirname, '..');
const startFolder = path.join(repoRoot, 'eggs', 'custom');
const outputFolder = repoRoot;

const rawBaseUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${BRANCH}/eggs/custom`;

const grouped = {}; // { minecraft: [ { name, url } ], ... }

function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(fullPath);
        } else if (entry.name.endsWith('.json')) {
            const relativePath = path.relative(startFolder, fullPath).replace(/\\/g, '/');
            const rawUrl = `${rawBaseUrl}/${relativePath}`;
            const parts = relativePath.split('/');
            const mainFolder = parts[0];

            try {
                const fileContent = fs.readFileSync(fullPath, 'utf-8');
                const parsed = JSON.parse(fileContent);
                const displayName = parsed.name || path.basename(entry.name, '.json');

                if (!grouped[mainFolder]) grouped[mainFolder] = [];
                grouped[mainFolder].push({ name: displayName, url: rawUrl });
            } catch (err) {
                console.warn(`⚠️ Fehler beim Parsen von ${relativePath}: ${err.message}`);
            }
        }
    }
}

walk(startFolder);

// Dateien schreiben
for (const [mainFolder, entries] of Object.entries(grouped)) {
    const urlsOnly = entries.map(entry => entry.url).join('\n') + '\n';
    const table = [
        '| Name | Raw URL |',
        '|------|---------|',
        ...entries.map(entry => `| ${entry.name} | ${entry.url} |`)
    ].join('\n') + '\n';

    fs.writeFileSync(path.join(outputFolder, `${mainFolder}.md`), urlsOnly);
    fs.writeFileSync(path.join(outputFolder, `${mainFolder}.table.md`), table);

    console.log(`✅ ${mainFolder}.md + ${mainFolder}.table.md erstellt (${entries.length} Einträge)`);
}

console.log('✅ Alle Markdown-Dateien wurden erfolgreich erstellt.');
