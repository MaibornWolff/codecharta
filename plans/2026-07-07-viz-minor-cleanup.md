---
name: viz-minor-cleanup
issue: n/a
state: complete
version: 1
---

## Goal

Close three MINOR items from the branch review (`plans/2026-07-05-full-branch-review-findings.md`): the visualization dep-cruiser rule gaps, the named test gaps, and moving the bundled first-run sample files to real cc.json 2.0.

## Tasks

### 1. dep-cruiser gaps (`visualization/.dependency-cruiser.js`) — all latent-gap closures, 0 violations today
- **Gap 1 mocks invisible:** move `^app/codeCharta/mocks/` + `\.mocks\.ts$` from `options.exclude` → `options.doNotFollow.path` (inbound prod→mock edges become visible; mocks stay unfollowed leaves) and add a `no-prod-import-of-mocks` forbidden rule.
- **Gap 2 cross-home raw-store:** add one back-referenced `state-home-no-cross-home-raw-store` rule (`$1` exempts only the same home's `store/`).
- **Gap 3 renderModel facade-only:** already enforced by `render-model-external-access-only-via-facade`; no change beyond Gap 4's anchor.
- **Gap 4 bootstrap outside fences:** broaden `from.path` `^app/codeCharta/` → `^app/` on the 7 facade-surface rules; add `^app/app\.config\.ts$` to `root-store-is-sole-composer` `from.pathNot`.

### 2. test gaps
- `edges.selector.spec.ts`: replace 3 tautological cases with hand-computed values + add delta-mode case.
- `indexedDBWriter.spec.ts`: fix chain-test title (`… + v14` → `… + v14 + v15`), import `migrateCcStateRecordToV15`, add dedicated per-version describe.
- `3dPrint.selectors.spec.ts`: rename 5 `… from dynamicSettings` → `… from mapState`.
- `loadFile.service.spec.ts`: add a service-level 2.0-envelope load test.

### 3. sample files → cc.json 2.0 (real `ccsh convert` output)
- Replace `assets/sample1..4.cc.json` (1.2) with ccsh 2.0 output under the SAME names (real MD5, hashed ids); drop `assets/sample1.cc2.json`.
- Preserve the original 1.x `sample1` as a test fixture for the parity spec (`resources/`).
- `sampleFiles.ts`: re-type imports as `CcJson2`, keep display fileName `sample1/2.cc.json`.
- `ccJson2ToCCFile.spec.ts`: repoint parity test (1.x fixture vs new 2.0 sample1), make map compare order-insensitive (ccsh sorts folders-first/alpha).
- `url.e2e.ts`: drop `sample1.cc2.json` import; point the 2.0-load test at `sample1.cc.json` (now 2.0).

## Steps

- [x] Task 1: dep-cruiser gaps — edits + `npm run lint:architecture` green (fb09a4599)
- [x] Task 2: test gaps — 4 spec files + `npm test` green (85fea0004)
- [x] Task 3: sample files → 2.0 — regenerated app/+public/ assets, repointed, fixed parity + e2e
- [x] Full `npm test` (384 suites, 2339 passed, 45 snapshots) + `npm run lint:architecture` (0 violations) + `tsc` (0 errors) green

## Notes

- ccsh convert verified: preserves projectName, real deterministic MD5, split metrics/dependency attributeTypes, edges intact; node-data parity with 1.x confirmed (only child ORDER differs → order-insensitive parity compare).
- No sample has blacklist/markedPackages, so ccsh convert-drop (#12) is a non-issue here.
- Display fileName stays `*.cc.json` (keeps mapSelector strip regex + explorer-tree/e2e name assertions green).
- User handles push + e2e run.
