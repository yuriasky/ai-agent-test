// Compare a Figma fingerprint dump against icons.manifest.json.
// Input: TSV file with lines "<figmaName>\t<nodeId>\t<hash>" (produced by the sync's fingerprint call).
// Output: JSON { added, changed, unchanged, removed, renamedCandidates } — lists of file names.
// Usage: node scripts/compare-fingerprints.js <fingerprints.tsv> [--write]  (--write updates nodeIds/hashes in the manifest)
import { readFileSync, writeFileSync } from 'node:fs';
import { toFileName } from './fingerprint.js';

const [tsvPath, flag] = process.argv.slice(2);
const manifest = JSON.parse(readFileSync('icons.manifest.json', 'utf8'));
const rows = readFileSync(tsvPath, 'utf8').trim().split(/\r?\n/).map((l) => l.split('\t'));
const seen = new Set();
const result = { added: [], changed: [], unchanged: [], removed: [] };
const next = {};
for (const [figmaName, nodeId, hash] of rows) {
  const file = toFileName(figmaName);
  seen.add(file);
  const prev = manifest.icons[file];
  if (!prev) result.added.push(file);
  else if (prev.hash !== hash) result.changed.push(file);
  else result.unchanged.push(file);
  next[file] = { figmaName, nodeId, hash };
}
for (const file of Object.keys(manifest.icons)) if (!seen.has(file)) result.removed.push(file);
// A removed + added pair sharing a node id is probably a rename in Figma.
const byNode = Object.fromEntries(result.added.map((f) => [next[f].nodeId, f]));
result.renamedCandidates = result.removed
  .filter((f) => manifest.icons[f].nodeId && byNode[manifest.icons[f].nodeId])
  .map((f) => ({ from: f, to: byNode[manifest.icons[f].nodeId] }));
if (flag === '--write') {
  manifest.icons = Object.fromEntries(Object.keys(next).sort().map((k) => [k, next[k]]));
  writeFileSync('icons.manifest.json', JSON.stringify(manifest, null, 2) + '\n');
}
console.log(JSON.stringify({ ...result, unchanged: result.unchanged.length }, null, 2));
