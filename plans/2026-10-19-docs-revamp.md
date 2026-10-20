---
name: Revamp gh-pages docs, README and GitHub About
state: complete
version: 1
---

## Goal

Bring the docs site, the root README and the GitHub About up to date with the code. Write in natural, concrete
language for developers and tech leads, give every page a title and description that work for search, and replace
stale screenshots with fresh ones, one lens per image.

## Tasks

### 1. Structure and SEO (astro.config.mjs, public/)
- Regroup the sidebar: Visualization by view, CLI with a Tools group (analyse, gate, inspect, convert, check)
- Merge or rename visualization pages (explore + map → code map, viewcube → map tools, sidebar → inspector,
  fileextensionbar → distribution bar, upload + change-maps → loading maps, custom-views → scenarios), and add
  redirects for every old slug
- Add head meta (og:image, twitter image), favicon and manifest links, robots.txt, and a better home title

### 2. Landing, overview and getting started
- Rewrite the landing page: one H1, the metric, domain and dependency views, `ccsh analyse`, no keyword stuffing
- Rewrite the introduction and getting started around `ccsh analyse`; add a desktop app page; fix the Docker commands

### 3. CLI pages
- Fix examples that break because of the `.gz` default, and document the missing options from the audit
- Cut duplicated boilerplate; give every page a description

### 4. Visualization pages
- Rewrite the dependency view and scenarios pages; fix the stale inspector and settings wording
- Add pages for keyboard shortcuts and URL parameters
- Capture fresh screenshots from the current build, one lens per image

### 5. README and GitHub About
- Refresh the README, link to codecharta.com, add `ccsh analyse`, and capture new hero images and a
  metric-only tour GIF
- Draft a new GitHub About description and topics for the user to apply

## Steps

- [x] Complete Task 1: Structure and SEO
- [x] Complete Task 2: Landing, overview and getting started
- [x] Complete Task 3: CLI pages
- [x] Complete Task 4: Visualization pages
- [x] Complete Task 5: README and GitHub About
- [x] Build the site, check links, run `npm run format:check`

## Notes

- Out of scope at the user's request: about/license, about/imprint, about/price, LICENSE.md and dev_docs/
- `ccsh analyse`, `ccsh gate` and Java 22 are documented as current, although they ship with the next analysis release
- Code bugs the audit found are reported to the user, not fixed here: `successive_weeks_with_commits` never gets
  values, plus wrong help texts (merge `-o`, csvimport FILE, simplecc.sh)
- Verified: Astro build in a scratch copy (97 pages, no broken links or anchors, unique titles, every page has a
  description), `npm run format:check` green. Pagefind indexing fails in the sandbox only
- Screenshots come from a fresh `ccsh analyse` map of CodeCharta itself without tests; Compare uses vis-2.0.0 vs today
- Kept as before at the user's request: the Docker command (`simplecc.sh`), the SEO text below the landing gallery and
  the Software Health Check text
- README GIFs show one view each and click through it; the hero row was dropped because every view section has its own
