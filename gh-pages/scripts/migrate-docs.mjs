// One-off migration: Jekyll (Minimal Mistakes) _docs -> Starlight src/content/docs/docs
// Run with: node scripts/migrate-docs.mjs
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { parse as parseYaml } from 'yaml';

const SRC = '../gh-pages/_docs';
const DEST = 'src/content/docs/docs';

// Liquid site.* variables used across the docs (from _config.yml)
const SITE_VARS = {
  'site.baseurl': '',
  'site.docs_overview': '/docs/overview',
  'site.docs_analysis': '/docs/analysis',
  'site.docs_about': '/docs/about',
  'site.docs_exporter': '/docs/exporter',
  'site.docs_filter': '/docs/filter',
  'site.docs_importer': '/docs/importer',
  'site.docs_parser': '/docs/parser',
  'site.docs_visualization': '/docs/visualization',
  'site.docs_how_to': '/docs/how-to',
  // malformed liquid in source that rendered empty; fix to the intended target
  'site.docs_overview/dockerized': '/docs/overview/dockerized',
  'site.web_visualization_link':
    'https://codecharta.com/visualization/app/index.html?file=codecharta_visualization.cc.json.gz&file=codecharta_analysis.cc.json.gz&area=rloc&height=sonar_complexity&color=sonar_complexity&edge=avgCommits&currentFilesAreSampleFiles=true',
};

const NOTICE_MAP = { warning: 'caution', danger: 'danger', info: 'note', success: 'tip', primary: 'note' };

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.md')) out.push(p);
  }
  return out;
}

function splitFrontMatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { fm: {}, body: raw };
  return { fm: parseYaml(m[1]) ?? {}, body: m[2] };
}

function replaceSiteVars(body) {
  return body.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (full, expr) => {
    const key = expr.trim();
    if (key in SITE_VARS) return SITE_VARS[key];
    return full; // leave anything unknown so it is visible during review
  });
}

function galleryToMarkdown(entries) {
  if (!Array.isArray(entries)) return '';
  return entries
    .map((e) => {
      const src = e.image_path || e.url || '';
      const alt = (e.title || e.alt || '').replace(/"/g, '');
      return `![${alt}](${src})`;
    })
    .join('\n\n');
}

function replaceGalleries(body, fm) {
  return body.replace(/\{%\s*include\s+gallery([^%]*)%\}/g, (full, args) => {
    const idMatch = args.match(/id\s*=\s*"([^"]+)"/);
    const key = idMatch ? idMatch[1] : 'gallery';
    const entries = fm[key];
    const md = galleryToMarkdown(entries);
    if (!md) {
      console.warn(`  ! gallery key "${key}" not found in front matter`);
      return '';
    }
    return md;
  });
}

function replaceImageWidths(body) {
  // ![alt](src){: width="20px"}  ->  <img src="src" alt="alt" width="20" />
  return body.replace(
    /!\[([^\]]*)\]\(([^)]+)\)\{:\s*width="(\d+)(?:px)?"\}/g,
    (_full, alt, src, w) => `<img src="${src}" alt="${alt}" width="${w}" />`
  );
}

function replaceNotices(body) {
  // marker on its own line, followed (after optional blank lines) by one paragraph
  return body.replace(
    /\{:\s*\.notice--(\w+)\}[ \t]*\n(?:[ \t]*\n)*([^\n]+(?:\n(?![ \t]*\n)[^\n]+)*)/g,
    (_full, type, para) => {
      const aside = NOTICE_MAP[type] || 'note';
      return `:::${aside}\n${para}\n:::`;
    }
  );
}

function demoteHeadings(body) {
  // Starlight renders the front-matter title as the page H1, so in-content
  // headings are demoted one level (# -> ##) to keep a single H1 and feed the
  // right-hand table of contents (h2/h3). Fenced code blocks are left untouched.
  const lines = body.split('\n');
  let inFence = false;
  let fenceToken = '';
  return lines
    .map((line) => {
      const fenceMatch = line.match(/^\s*(```+|~~~+)/);
      if (fenceMatch) {
        if (!inFence) {
          inFence = true;
          fenceToken = fenceMatch[1][0];
        } else if (fenceMatch[1][0] === fenceToken) {
          inFence = false;
        }
        return line;
      }
      if (inFence) return line;
      const h = line.match(/^(#{1,5}) (.*)$/);
      if (h) return `#${h[1]} ${h[2]}`;
      return line;
    })
    .join('\n');
}

function buildFrontMatter(fm) {
  const lines = ['---'];
  const title = String(fm.title ?? '').trim();
  lines.push(`title: ${JSON.stringify(title)}`);
  const excerpt = typeof fm.excerpt === 'string' ? fm.excerpt.trim() : '';
  if (excerpt) lines.push(`description: ${JSON.stringify(excerpt)}`);
  lines.push('---');
  return lines.join('\n');
}

function slugFromPermalink(permalink) {
  // "/docs/overview/introduction/" -> "overview/introduction"
  let p = String(permalink).trim().replace(/^\/+|\/+$/g, '');
  if (p.startsWith('docs/')) p = p.slice('docs/'.length);
  return p;
}

const files = walk(SRC).sort();
const redirects = {};
let count = 0;

for (const file of files) {
  const raw = readFileSync(file, 'utf8');
  const { fm, body } = splitFrontMatter(raw);
  if (!fm.permalink) {
    console.warn(`SKIP (no permalink): ${file}`);
    continue;
  }
  const slug = slugFromPermalink(fm.permalink);
  let out = body;
  out = replaceSiteVars(out);
  out = replaceImageWidths(out);
  out = replaceGalleries(out, fm);
  out = replaceNotices(out);
  out = demoteHeadings(out);
  out = out.replace(/\n{3,}/g, '\n\n').trimStart();

  const header = buildFrontMatter(fm);
  const destPath = join(DEST, `${slug}.md`);
  mkdirSync(dirname(destPath), { recursive: true });
  writeFileSync(destPath, `${header}\n\n${out}\n`);

  // collect redirects
  const rf = fm.redirect_from;
  if (rf) {
    const arr = Array.isArray(rf) ? rf : [rf];
    for (const from of arr) {
      const f = String(from).trim();
      redirects[f.replace(/\/$/, '') || '/'] = `/docs/${slug}`;
    }
  }
  count++;
  console.log(`  ${file} -> ${destPath}`);
}

console.log(`\nMigrated ${count} docs.`);
console.log('\nRedirects (add to astro.config redirects):');
console.log(JSON.stringify(redirects, null, 2));
