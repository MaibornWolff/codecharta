---
name: Go Zoneless (remove zone.js)
issue:
state: complete
version: 1
---

## Goal

Run the visualization fully zoneless: make every component OnPush + signal/explicit change-detection driven, make all async sources zoneless-safe, switch the test env off zone, then flip the app to `provideZonelessChangeDetection()` and remove `zone.js` entirely. Story: `stories/remove-zonejs.md` (#1).

## Decisions (agreed 2026-06-24)

- **Convert-first, flip-last**: get all components OnPush + every async source zoneless-safe BEFORE flipping the provider and dropping zone.js. The flip is the last commit.
- Delivered as **multiple small commits**, worked to completion — no time pressure.
- Covers **both `features/` and `ui/`** components, so it runs before the `ui/`→`features/` migration (`stories/migrate-ui-feature-architecture.md`) and the migration inherits zoneless-correct code.
- **Supersedes** the zoneless parts of `plans/2026-05-05-zoneless-features.md` and Task 7 of `plans/2026-06-12-finish-feature-architecture-migration.md`.

## Background (audit 2026-06-24)

- `app/main.ts` bootstraps with `provideZoneChangeDetection()`; `import "zone.js"` in both `main.ts` and `polyfills.ts`.
- `zone.js ^0.16.1` in `package.json`; `angular.json` polyfills: `["zone.js"]` (build) and `["zone.js", "zone.js/testing"]` (test); `setupJestUnit.ts` calls `setupZoneTestEnv()`.
- OnPush missing: 25/109 `features/` components, 9/10 `ui/` components (full lists in the superseded plans + re-audit).
- No `NgZone` / `runOutsideAngular` / `ApplicationRef.tick` usage anywhere. Risk concentrates in: `.subscribe()` inside ~9 components, `setTimeout` in ~8 (esp. `export3DMapButton` 100ms TODO hack, `print3DButton`), and Three.js / DOM callbacks in `ui/codeMap` + `ui/viewCube`.

## Tasks

### 1. Guardrail + fresh audit
- **Decision (2026-06-24): skip the ESLint guardrail.** Repo is deliberately Biome-only (no ESLint); not worth bolting on a second linter for one rule. The manual audit below is the backlog; the zoneless flip + test suite are the safety net.
- Fresh audit (2026-06-24): 35 components lack OnPush — 25 in `features/`, 9 in `ui/`, plus root `codeCharta.component.ts`. `0` `fakeAsync`/`tick` tests exist, so Task 5 has no zone-test rewrites. Angular is v21; `provideZonelessChangeDetection()` is stable.

### 2. Backfill OnPush in `features/` (~25 components)
- Easy buttons/static panels first (single decorator line), then dialogs with form/local state.
- For each: ensure mutable fields are signals / `@Input` / `FormControl`; otherwise lift to a signal or add `cdr.markForCheck()`. Run the component test after each.

### 3. Backfill OnPush in `ui/` (~9 components) — the hard ones
- `codeMap`, `viewCube`, `zoomSlider`, `fileExtensionBar(+segment, distributionMetric)`, `errorDialog`, `loadingFileProgressSpinner`, `actionIcon`, `resetSettingsButton`.
- These hold the Three.js render surface and the `.subscribe()`/`setTimeout` patterns — treat carefully (see Task 4).

### 4. Make async sources zoneless-safe
- Replace `.subscribe()`-that-mutates-fields with signals (`toSignal`) / async pipe, or add explicit `markForCheck()`.
- Fix timing hacks: `export3DMapButton` `setTimeout(100)` and `print3DButton` — drive UI from a signal/observable instead of relying on a zone tick.
- Audit Three.js callbacks (mouse events, render loop) and raw DOM listeners: under zoneless they won't auto-trigger CD — ensure each updates a signal or calls `markForCheck()`.
- Verify the map render path still fires: `RenderCodeMapEffect` → `codeMapRenderService.render()` → `threeRendererService.render()` is ngrx/rAF-driven, not zone-driven — confirm interactions still repaint.

### 5. Switch the test environment off zone
- Point `setupJestUnit.ts` at the zoneless setup (`jest-preset-angular` zoneless env / `provideZonelessChangeDetection` in `TestBed`); drop `zone.js/testing` from `angular.json` test polyfills.
- Rewrite any `fakeAsync`/`tick` tests (they require zone) to `async`/`await fixture.whenStable()`.

### 6. Flip the app + remove zone.js (final commit)
- `main.ts`: `provideZoneChangeDetection()` → `provideZonelessChangeDetection()`; remove `import "zone.js"`.
- Remove `import "zone.js"` from `polyfills.ts`; remove `polyfills: ["zone.js"...]` from `angular.json` (build + test).
- Uninstall `zone.js` from `package.json`; `npm i` to refresh the lockfile.

### 7. Verify
- `npm test` green; `npm run e2e` green.
- Manual smoke (`npm run dev`): map renders + rotates/zooms/hovers/selects; layout/metric changes repaint; dialogs (3D export, scenarios, changelog, global config) update; file upload + loading spinner.

## Steps

- [x] Complete Task 1: fresh audit (ESLint guardrail skipped — Biome-only repo)
- [x] Complete Task 2: Backfill OnPush in `features/` (25 components)
- [x] Complete Task 3: Backfill OnPush in `ui/` + root (10 components)
- [x] Complete Task 4: Make async sources zoneless-safe
- [x] Complete Task 5: Switch test env off zone
- [x] Complete Task 6: Flip provider + remove zone.js
- [~] Complete Task 7: Verify — unit ✅ + build ✅; e2e/manual smoke blocked in this sandbox

## Notes

- Order is intentional: components safe → test env safe → flip last. Do not flip the provider until Tasks 2–5 are green.
- Highest-risk surface is `ui/codeMap`/`ui/viewCube` (Three.js + DOM events). Smoke-test interactions explicitly after the flip.
- `fakeAsync` was a non-issue (0 usages). The actual zone-test breakage was `waitForAsync` (4 specs) plus latent errors that zone had been swallowing: JSDOM popover API (`:popover-open`), an orphaned IndexedDB `tx.done` rejection, and the heavy 3D export dialog rendering in a button test. All fixed.
- Verification done: full unit suite (2244 tests) green under the zoneless test env; also green with everything OnPush under the *old* zone env (proves OnPush correctness independent of the flip); production build succeeds and ships zero `__zone_symbol__`.
- **e2e + manual browser smoke could not run in this sandbox** (ubuntu26.04-arm64): Google Chrome unsupported on Arm64, `chromium-browser` is a snap stub, Playwright's bundled Chromium unsupported on this OS. Run `npm run e2e` in CI / on the host to finish Task 7. The 8 e2e specs cover the zoneless-sensitive interactions (context menu, scenarios, sidebars, explorer, metrics bar).

## Commits

1. `refactor(visualization): add OnPush to features/ components for zoneless (#1)`
2. `refactor(visualization): add OnPush to ui/ + root components for zoneless (#1)`
3. `test(visualization): run unit tests zoneless (#1)`
4. `feat(visualization)!: enable zoneless change detection, remove zone.js (#1)`
