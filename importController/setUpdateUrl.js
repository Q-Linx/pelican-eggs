const fs = require('fs');
const path = require('path');

const GITHUB_USER = 'Q-Linx';
const GITHUB_REPO = 'pelican-eggs';
const BRANCH = 'main';

const repoRoot = path.resolve(__dirname, '..');
const jsonBase = path.join(repoRoot, 'eggs', 'default');
const rawBase = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${BRANCH}/eggs/default`;

function processJsonFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            processJsonFiles(fullPath);
        } else if (entry.name.endsWith('.json')) {
            try {
                const jsonText = fs.readFileSync(fullPath, 'utf-8');
                const jsonData = JSON.parse(jsonText);

                const relativePath = path.relative(jsonBase, fullPath).replace(/\\/g, '/');
                const rawUrl = `${rawBase}/${relativePath}`;

                // Setze update_url
                if (!jsonData.meta) jsonData.meta = {};
                jsonData.meta.update_url = rawUrl;

                fs.writeFileSync(fullPath, JSON.stringify(jsonData, null, 4));
                console.log(`✅ update_url gesetzt in: ${relativePath}`);
            } catch (err) {
                console.warn(`❌ Fehler bei Datei ${fullPath}: ${err.message}`);
            }
        }
    }
}

processJsonFiles(jsonBase);
console.log('✅ Alle update_url-Werte wurden aktualisiert.');
