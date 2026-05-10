import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

mkdirSync('dist', { recursive: true });

const manifest = JSON.parse(readFileSync('public/appsscript.json', 'utf8'));

if (process.argv.includes('--script-only')) {
  delete manifest.webapp;
}

writeFileSync('dist/appsscript.json', `${JSON.stringify(manifest, null, 2)}\n`);
