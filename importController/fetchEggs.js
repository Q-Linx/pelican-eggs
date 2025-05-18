require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// GitHub Repos, die du importieren willst
const user = 'pelican-eggs';
const repos = ['minecraft', 'generic', 'chatbots', 'games-steamcmd', 'games-standalone'];
const branch = 'main';
const token = process.env.GITHUB_TOKEN;

// Zielpfad: eggs/default relativ vom Skript
const baseTargetDir = path.resolve(__dirname, '..', 'eggs', 'default');

async function downloadJsonFiles(repo, dir = '') {
    const apiBase = `https://api.github.com/repos/${user}/${repo}/contents`;
    const url = `${apiBase}/${dir}?ref=${branch}`;

    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Node.js',
            ...(token ? { Authorization: `token ${token}` } : {})
        }
    });

    if (!res.ok) {
        console.error(`[${repo}] Fehler bei ${url}: ${res.status}`);
        return;
    }

    const files = await res.json();

    for (const file of files) {
        if (file.type === 'dir') {
            await downloadJsonFiles(repo, file.path);
        } else if (
            file.name.endsWith('.json') &&
            !file.name.toLowerCase().includes('pterodactyl')
        ) {
            const parts = file.path.split('/');
            const topLevelFolder = parts[0];
            const subfolder = parts.length >= 2 ? parts[1] : path.basename(file.name, '.json');
            const filename = `${subfolder}.json`;

            const localDir = path.join(baseTargetDir, repo, topLevelFolder);
            const localPath = path.join(localDir, filename);

            fs.mkdirSync(localDir, { recursive: true });

            const fileRes = await fetch(file.download_url);
            const content = await fileRes.text();
            fs.writeFileSync(localPath, content);

            console.log(`[${repo}] Gespeichert: ${localPath}`);
        }
    }
}

(async () => {
    for (const repo of repos) {
        console.log(`⏬ Starte Download für: ${repo}`);
        await downloadJsonFiles(repo);
    }
    console.log('✅ Alles erledigt!');
})();
