// Fails if any file in icons/ is not a kebab-case .svg (e.g. "arrow-left.svg").
import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = 'icons';
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*\.svg$/;

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const bad = walk(ROOT)
  .filter((file) => !file.endsWith('.gitkeep'))
  .filter((file) => !KEBAB.test(file.split(/[\\/]/).pop()));

if (bad.length) {
  console.error('Icon file names must be kebab-case .svg:');
  for (const file of bad) console.error(`  - ${relative('.', file)}`);
  process.exit(1);
}

console.log('All icon file names are kebab-case.');
