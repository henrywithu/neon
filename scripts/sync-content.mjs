import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://henrywithu.com';
const headers = { 'User-Agent': 'Mozilla/5.0 (Trapnest Neon content sync)' };
const response = await fetch(origin, { headers });
if (!response.ok) throw new Error(`Trapnest: HTTP ${response.status}`);
const html = await response.text();
const key = html.match(/data-key="([a-f0-9]+)"/)?.[1];
if (!key) throw new Error('Public Ghost Content API key not found.');
const url = new URL('/ghost/api/content/posts/', origin);
url.search = new URLSearchParams({
  key,
  limit: 'all',
  filter: 'published_at:>=2026-07-01',
  fields: 'id,title,slug,url,published_at,feature_image,custom_excerpt,excerpt',
}).toString();
const result = await fetch(url, { headers });
if (!result.ok) throw new Error(`Content API: HTTP ${result.status}`);
const { posts } = await result.json();
await mkdir(path.join(root, 'public/content/images'), { recursive: true });
const journal = [];
for (const post of posts) {
  let image = '';
  if (post.feature_image) {
    const imageUrl = new URL(post.feature_image);
    if (imageUrl.origin !== origin) throw new Error(`Unexpected image origin: ${imageUrl.origin}`);
    const ext = path.extname(imageUrl.pathname) || '.webp';
    const name = createHash('sha256').update(post.feature_image).digest('hex').slice(0, 16) + ext;
    const asset = await fetch(imageUrl, { headers });
    if (!asset.ok) throw new Error(`Image: HTTP ${asset.status}: ${post.slug}`);
    await writeFile(path.join(root, 'public/content/images', name), Buffer.from(await asset.arrayBuffer()));
    image = '/content/images/' + name;
  }
  journal.push({
    id: post.id,
    title: post.title,
    url: post.url,
    date: post.published_at,
    excerpt: post.custom_excerpt || post.excerpt || '',
    image,
    sourceImage: post.feature_image,
  });
}
await mkdir(path.join(root, 'src/content'), { recursive: true });
await writeFile(path.join(root, 'src/content/journal.json'), JSON.stringify({
  source: origin,
  from: '2026-07-01',
  fetchedAt: new Date().toISOString(),
  posts: journal,
}, null, 2) + '\n');
console.log(`Synced ${journal.length} posts published since July 1, 2026.`);
