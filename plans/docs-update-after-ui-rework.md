---
name: docs-update-after-ui-rework
issue: none
state: complete
version: unreleased
---

## Goal

Bring the Astro documentation (`gh-pages/`) in line with the product: rewrite the outdated visualization and CLI pages, add pages for the features that have none, and replace the outdated screenshots. Based on the findings of `docs-outdated-audit.md`.

## Tasks

### 1. Visualization pages
- Correct every outdated page (user controls overview, explore, explorer, settings, metrics, compare, 3D print, legend, scenarios, web studio)
- Replace the Viewcube page with a page on zoom and the map tools

### 2. New pages
- Views and how to switch them, dependency view, domain view, map layouts (radial layouts included), focus
- Add them to the sidebar

### 3. CLI pages
- Fix the factual mismatches the audit found (Java version, cc.json 2.x examples, options, metrics, links)
- Leave the two code bugs the audit found alone and report them

### 4. Screenshots
- Retake every outdated screenshot from the running app, add ones for the new pages
- Delete the images no page references

### 5. Verify
- Build the docs site, check links and image references

## Steps

- [x] Complete Task 1: Visualization pages
- [x] Complete Task 2: New pages
- [x] Complete Task 3: CLI pages
- [x] Complete Task 4: Screenshots
- [x] Complete Task 5: Verify
