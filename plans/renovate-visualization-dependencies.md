---
name: renovate-visualization-dependencies
issue: #4396, #4350, #4300, #4298, #4297
state: complete
version: 1
---

## Goal

Review and merge the 5 open Renovate PRs targeting the visualization module. One is green and ready to merge; the other four have failing CI and need manual intervention.

## PRs Overview

| PR | Package | Change | CI Status | Breaking Change |
|----|---------|--------|-----------|-----------------|
| #4396 | zone.js | ^0.15.1 → ^0.16.0 | ALL PASS | Drops IE/old Edge |
| #4300 | d3-hierarchy | ^2.0.0 → ^3.0.0 | FAIL (Unit Tests) | ESM-only |
| #4298 | color-convert | 2.0.1 → 3.1.3 | FAIL (Unit Tests) | ESM-only |
| #4350 | marked | ^5.1.2 → ^17.0.0 | FAIL (Unit + E2E) | Multiple breaking versions |
| #4297 | ajv | ^6.12.6 → ^8.0.0 | FAIL (Unit + E2E) | New API, draft-2020-12 default |

## Tasks

### 1. Merge PR #4396 — zone.js 0.16
- CI is fully green, ready to merge
- Only drops IE/non-Chromium Edge support (irrelevant for us)
- Minor bugfixes and jasmine v6 support

### 2. Fix PR #4300 — d3-hierarchy v3
- Unit tests fail
- Breaking change: switched to ESM (`type: module`)
- Check if our bundler/test config handles the ESM import correctly
- May need Jest transform config or `transformIgnorePatterns` adjustment for this package
- The API itself is unchanged — only the module format changed

### 3. Fix PR #4298 — color-convert v3
- Unit tests fail
- Breaking change: moved to ESM (`type: module`)
- Same ESM handling issue as d3-hierarchy
- Also note: v3.1.1 was compromised (supply chain attack) but v3.1.2+ is safe
- May need Jest transform config update

### 4. Fix PR #4350 — marked v17
- Both unit tests and E2E tests fail
- Massive version jump (v5 → v17) with many breaking changes across versions
- Key breaking changes: list tokenizer rework, checkbox token changes, simplified listItem renderer
- Check where `marked` is used in the codebase
- Review the usage patterns and adapt to the new API
- Consider if an intermediate version (e.g., v14 or v15) would be easier to migrate to first

### 5. Fix PR #4297 — ajv v8
- Both unit tests and E2E tests fail
- Major API changes: new `Ajv` constructor, different schema compilation approach
- Default JSON Schema draft changed (draft-07 → draft-2020-12)
- Switched from `uri-js` to `fast-uri`
- Find all `ajv` usage in the codebase and update to v8 API
- May need to explicitly set `draft-07` mode if schemas haven't been updated

## Steps

- [ ] Merge #4396 (zone.js) — already green
- [x] Fix #4300 (d3-hierarchy) — Jest ESM config fix
- [x] Fix #4298 (color-convert) — Jest ESM config fix + removed from Angular allowedCommonJsDependencies
- [x] Fix #4350 (marked v17) — removed deprecated headerIds option
- [x] Fix #4297 (ajv v8) — ErrorObject import, instancePath, strict:false, updated error messages in tests

## Notes

- Start with zone.js since it's green — clears the easiest one
- d3-hierarchy and color-convert likely share the same root cause (ESM handling in Jest) — fixing one probably fixes the pattern for the other
- marked and ajv require actual code changes, not just config fixes
- After each merge, Renovate auto-rebases remaining PRs, so merge sequentially and let CI re-run
- marked v5 → v17 is a huge jump; read changelogs carefully for each major version to understand all API changes
