const https = require('https');
const fs = require('fs');
const path = require('path');

const USERNAME = 'binduprabhu';
const OUTPUT_DIR = path.join(__dirname, '..', 'content', 'projects');

// Repositories to exclude (e.g., the portfolio itself)
const EXCLUDE_REPOS = [
  'binduprabhu.github.io',
  'bchiang7', // Just in case
];

async function fetchRepos() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/users/${USERNAME}/repos?sort=updated&per_page=100`,
      method: 'GET',
      headers: {
        'User-Agent': 'Node.js',
        // GITHUB_TOKEN is used for higher rate limits in GitHub Actions
        ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}),
      },
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Failed to fetch repos: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', e => {
      reject(e);
    });
    req.end();
  });
}

async function main() {
  try {
    const repos = await fetchRepos();

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Filter repos: not forks, not in exclude list, has description
    const filteredRepos = repos.filter(
      repo => !repo.fork && !EXCLUDE_REPOS.includes(repo.name) && repo.description,
    );

    for (const repo of filteredRepos) {
      const fileName = `${repo.name}.md`;
      const filePath = path.join(OUTPUT_DIR, fileName);

      // We only create the file if it doesn't already exist or if we want to overwrite it.
      // For now, let's overwrite to keep it updated with latest GitHub desc/tech.
      const content = `---
date: '${repo.created_at.split('T')[0]}'
title: '${repo.name.replace(/-/g, ' ')}'
github: '${repo.html_url}'
external: '${repo.homepage || ''}'
tech:
  - ${repo.language || 'Data Science'}
showInProjects: true
---

${repo.description}
`;

      fs.writeFileSync(filePath, content);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
