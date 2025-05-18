const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..', 'eggs', 'default');

function collectImages(repoDir) {
    const repoPath = path.join(baseDir, repoDir);
    const imageSet = new Set();

    function scan(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                scan(fullPath);
            } else if (entry.name.endsWith('.json')) {
                try {
                    const raw = fs.readFileSync(fullPath, 'utf-8');
                    const parsed = JSON.parse(raw);
                    const images = parsed.docker_images;

                    if (images && typeof images === 'object') {
                        Object.values(images).forEach(image => imageSet.add(image));
                    }
                } catch (err) {
                    console.warn(`⚠️ Fehler beim Parsen von ${fullPath}:`, err.message);
                }
            }
        }
    }

    scan(repoPath);

    const sortedImages = Array.from(imageSet).sort();
    const targetFile = path.join(repoPath, 'IMAGES.md');
    fs.writeFileSync(targetFile, sortedImages.join('\n') + '\n');
    console.log(`✅ Generiert: ${targetFile}`);
}

function main() {
    const repos = fs.readdirSync(baseDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);

    for (const repo of repos) {
        collectImages(repo);
    }

    console.log('✅ Alle IMAGES.md-Dateien wurden geschrieben (nur Images, keine Duplikate).');
}

main();
