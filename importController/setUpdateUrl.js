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
                const tagPath = path.dirname(relativePath); // z. B. minecraft/java

                const firstFolder = tagPath.split('/')[0]; // z. B. minecraft

                // Setze update_url
                if (!jsonData.meta) jsonData.meta = {};
                jsonData.meta.update_url = rawUrl;

                // Setze tags
                jsonData.tags = [tagPath];
                if (firstFolder && firstFolder !== tagPath) {
                    jsonData.tags.push(firstFolder);
                }

                fs.writeFileSync(fullPath, JSON.stringify(jsonData, null, 4));
                console.log(`✅ updated: ${relativePath}`);
            } catch (err) {
                console.warn(`❌ Fehler bei Datei ${fullPath}: ${err.message}`);
            }
        }
    }
}

processJsonFiles(jsonBase);
console.log('✅ Alle update_url und tags wurden aktualisiert.');
