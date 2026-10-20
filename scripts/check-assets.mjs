import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(path.join(root, 'research/asset-manifest.json'), 'utf8'));
let verified = 0;
const failures = [];
for (const asset of manifest) {
  if (asset.path.startsWith('/assets/')) continue; // Research-only production JS, not runtime assets.
  try {
    const bytes = await readFile(path.join(root, 'public', asset.path));
    const digest = createHash('sha256').update(bytes).digest('hex');
    if (digest !== asset.sha256) failures.push(`${asset.path}: digest mismatch`);
    else verified++;
  } catch { failures.push(`${asset.path}: missing`); }
}
const journal = JSON.parse(await readFile(path.join(root, 'src/content/journal.json'), 'utf8'));
for (const post of journal.posts) {
  if (post.date < '2026-07-01') failures.push(`${post.title}: published before July`);
  if (post.image) {
    try { await access(path.join(root, 'public', post.image)); }
    catch { failures.push(`${post.image}: journal image missing`); }
  }
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else console.log(`Verified ${verified} original asset digests and ${journal.posts.length} journal entries.`);
