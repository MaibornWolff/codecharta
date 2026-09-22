---
name: readme-rework
issue: <#issueid>
state: complete
version: -
---

## Goal

Rework the root README into a short, engaging pitch for developers that is correct for today's
CodeCharta: metric city and domain view side by side, current analysers, fresh screenshots and a GIF.

## Tasks

### 1. Generate maps of CodeCharta itself
- Build local ccsh, run `analysis/script/simplecc-local.sh` on the repo (includes domain parser)
- Older map for a delta shot

### 2. Capture screenshots and a GIF
- Build visualization, drive it with Playwright: metric city, word cloud, delta, explorer
- GIF from stepped camera frames via ffmpeg (<5 MB)

### 3. Rewrite README
- Hero with both views, one-line tagline, trimmed badges, quickstart, compact analyser table
- Fix broken logo link, `ccsh -h` typo, dead doc slugs; keep Service Offerings as is
- Replace outdated assets

## Steps

- [x] Complete Task 1: Generate maps
- [x] Complete Task 2: Screenshots and GIF
- [x] Complete Task 3: Rewrite README

## Notes

- No changelog entry: the README is not a release change.
