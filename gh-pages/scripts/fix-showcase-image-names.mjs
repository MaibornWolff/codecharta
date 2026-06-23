// One-off: rename showcase images to URL-safe names (drop [ ] , = spaces) and
// rewrite every reference so no percent-encoding is needed (which 404s on the
// dev server / many static hosts because %2C isn't decoded back to a comma).
import { readFileSync, writeFileSync, readdirSync, statSync, renameSync } from 'node:fs';
import { join } from 'node:path';

const SHOWCASE_DIR = 'public/assets/images/showcase';
const REFERENCE_FILES = [
  'src/components/Showcase.astro',
  'src/content/docs/examples/aoo.md',
  'src/content/docs/examples/httpd.md',
  'src/content/docs/examples/junit4.md',
  'src/content/docs/examples/junit5.md',
  'src/content/docs/examples/netbeans.md',
];

function safeBase(base) {
  return base
    .replace(/[[\]=,\s]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

// transform a full ".../<base>.<ext>" path, only touching the basename
function safePath(p) {
  const slash = p.lastIndexOf('/');
  const dir = p.slice(0, slash + 1);
  const name = p.slice(slash + 1);
  const dot = name.lastIndexOf('.');
  const base = dot >= 0 ? name.slice(0, dot) : name;
  const ext = dot >= 0 ? name.slice(dot) : '';
  return dir + safeBase(base) + ext;
}

function walk(dir) {
  const out = [];
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

// 1. rename files on disk
let renamed = 0;
const seen = new Set();
for (const file of walk(SHOWCASE_DIR)) {
  const target = safePath(file);
  if (target !== file) {
    if (seen.has(target)) {
      console.error(`COLLISION: ${file} -> ${target}`);
      process.exit(1);
    }
    renameSync(file, target);
    renamed++;
  }
  seen.add(target);
}
console.log(`Renamed ${renamed} files.`);

// 2. rewrite references (handles both percent-encoded and literal paths)
const IMG_RE = /\/assets\/images\/showcase\/[^"'`\s)]+?\.(?:png|jpe?g|svg|gif)/gi;
let totalRefs = 0;
for (const ref of REFERENCE_FILES) {
  const before = readFileSync(ref, 'utf8');
  let count = 0;
  const after = before.replace(IMG_RE, (m) => {
    count++;
    return safePath(decodeURIComponent(m));
  });
  if (after !== before) writeFileSync(ref, after);
  totalRefs += count;
  console.log(`  ${ref}: ${count} refs`);
}
console.log(`Rewrote ${totalRefs} references.`);
