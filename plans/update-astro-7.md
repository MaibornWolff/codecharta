---
name: Update Astro docs site to Astro 7
issue: <none>
state: complete
version: 1
---

## Goal

Move the gh-pages docs site from Astro 6.4 / Starlight 0.40 to Astro 7.3 / Starlight 0.42 to clear all
known advisories (1 critical, 6 high) without changing the rendered site.

## Tasks

### 1. Dependencies
- astro ^7.3.2, @astrojs/starlight ^0.42.0, sharp ^0.35.4
- add @astrojs/markdown-remark ^7.3.1 so rehype-external-links keeps running (Astro 7 defaults to Sätteri)
- regenerate package-lock.json from scratch with npm 11 (the old lockfile cannot resolve the peer ranges)

### 2. Config
- pass rehypePlugins through `unified()` instead of the deprecated `markdown.rehypePlugins`
- keep `compressHTML: true`; Astro 7's default `'jsx'` glues header and sidebar words together

### 3. Verify
- npm audit, npm audit signatures, platform bindings in the lockfile
- build before/after and compare pages, external links, rendered text and spacing

## Steps

- [x] Complete Task 1: Dependencies
- [x] Complete Task 2: Config
- [x] Complete Task 3: Verify

## Notes

- The site needs Node >= 22.19: Astro 7 advertises 22.12, but its undici 8 dependency needs 22.19. CI uses Node 24.
- Starlight 0.41+ supports Chrome >= 116, Safari >= 17, Firefox >= 125 only.
- Pagefind crashes in the arm64 dev container (16K memory pages); CI's x86 runner is unaffected.
