---
name: feature-layer-fencing
issue: n/a
state: todo
version: 1
---

## Goal

Fence `visualization/app/codeCharta/features/*` with dependency-cruiser rules so that (1) outside code can only depend on a feature's `facade.ts`, never its internals, and (2) inside a feature, dependencies only flow `facade -> components -> services -> stores` (never `components -> stores` directly, never `services -> components`).

## Target rules

```
outside          -> feature/facade.ts   OK
outside          -> feature/* (else)    NOT OK   (today: components/ and the effects bundle are also exempt)

feature/facade.ts     -> feature/components, feature/services   OK
feature/components/   -> feature/services                        OK
feature/components/   -> feature/stores                          NOT OK (must go through services)
feature/services/     -> feature/stores                          OK
feature/services/     -> feature/components                      NOT OK
```

## Findings (investigated 2026-07-15, no files changed)

- The live `visualization/.dependency-cruiser.js` passes clean today (0 violations, acyclic, 1021 modules / 4023 deps). The new rules are purely additive on top of it.
- dependency-cruiser already expresses this exact facade/capture-group pattern for lenses, state homes and renderModel — no new mechanism needed, and no circular-dependency blocker showed up while tracing who'd need to reach whom through a facade.
- `migration-2-0-plans/CONVENTIONS.md:81` already names the target rules `feature-components-go-through-services` / `feature-services-read-repos-not-store` for the lens migration — this generalizes that same idea to all of `features/`.
- Verified against a scratch config (`forbidden` rules only, not committed) run via `depcruise app --config <scratch>`. **87 real violations** across 4 rules, broken down below.

### 1. `components -> stores` (must go via services) — 57 violations, all same-feature
No cross-feature store leaks (already blocked by existing rules). Concentrated in two features:
- metricsBar: 25
- sidebarExplorer: 10
- nodeContextMenu: 4
- globalSettings: 4
- sidebarInspector: 3
- navBar: 2, 3dPrint: 2
- 1 each: viewCubeToolbox, shared, scenarios, legend, labelSettings, fileExtensionBar, bottomBar

### 2. `outside feature -> non-facade` (tightens `feature-no-external-access-to-internals`, drops the `components/` exemption) — 9 violations
- 3x `views/codeCharta.component.ts` -> `shared`/`changelog` dialog components directly
- 6x `app.config.ts` -> a feature's `effects/<feature>.effects.ts` bundle directly — **this is a documented, deliberate exemption today** (ngrx effects-registration manifest; routing it through the facade would pull every effect's cross-feature deps into the facade graph and risk cycles). Needs an explicit decision: keep the carve-out (recommended) or fold it under the facade.

### 3. `cross-feature -> non-facade` (tightens `feature-cross-feature-only-via-public-api`, same exemption drop) — 20 violations
- This is where `scenarios` shows up: `metricsBar/labelsScenariosSegment.component.ts` reaches directly into `scenarios`' dialog components (3x) and `labelSettings`' panel (1x)
- Rest is mostly every feature reaching directly into `shared/`'s dumb components (`inlineColorPicker`, `resetSettingsButton`, `errorDialog`, `actionIcon`) and into `3dPrint`/`globalSettings` dialogs
- `shared/`'s components are used app-wide as a reusable UI kit today (dumb primitives per CONVENTIONS.md Part 2) — forcing this through `shared/facade.ts` means that facade re-exporting presentational components, not just behavior/data, which is a bit unusual for a facade but mechanically fine (dependency-cruiser only sees the module edge)

### 4. `services -> components` — 1 violation, but it's real
`scenarios/services/scenarioViewModel.service.ts` -> `scenarios/components/scenarioListDialog/scenarioView.model.ts`. Not a stray colocated file: `ScenarioViewModelService.toScenarioView()` builds and returns a `ScenarioView`, and that type is the real return-type contract with the component that renders it. Fix is a one-file move: relocate `scenarioView.model.ts` out of `components/scenarioListDialog/` into `services/` (or a feature-level `model/`), component imports it from there instead.

## Tasks

### 1. Resolve two open decisions before writing the rules
- Effects-bundle carve-out for `app.config.ts` (rule 2 above): keep the exemption or not.
- Rollout strategy for the 87 existing violations: land rules as `warn` and fix incrementally (matches the `warn` -> `error` precedent already used in CONVENTIONS.md Part 3), fix all violations first then land as `error`, or land as `error` now with explicit per-path exemptions for the current violations.

### 2. Add the 4 rules to `visualization/.dependency-cruiser.js`
- Tighten `feature-no-external-access-to-internals` and `feature-cross-feature-only-via-public-api` to drop the `components/` exemption (keep or adjust the effects-bundle exemption per decision above).
- Add `feature-components-go-through-services` (components -> stores forbidden).
- Add `feature-services-not-to-components` (services -> components forbidden).
- Mirror the existing style: named rule, `severity`, `comment` explaining the why, `from`/`to` path regex with `pathNot` for spec/e2e/po.

### 3. Fix the 87 violations feature by feature
- Quick wins first: the 1 services->components hit (scenarios), the 9 outside->non-facade hits (views/codeCharta.component.ts + app.config.ts decision).
- `shared/facade.ts`: re-export the dumb components that other features currently import directly (inlineColorPicker, resetSettingsButton, errorDialog, actionIcon, loadingFileProgressSpinner) to close the 20 cross-feature hits.
- The big lift: introduce/extend a service layer between components and stores in `metricsBar` (25) and `sidebarExplorer` (10) first, then the smaller features (nodeContextMenu, globalSettings, sidebarInspector, navBar, 3dPrint, viewCubeToolbox, legend, labelSettings, fileExtensionBar, bottomBar — 1-4 each).

## Steps

- [ ] Decide effects-bundle carve-out and rollout strategy (Task 1)
- [ ] Add the 4 rules to `visualization/.dependency-cruiser.js` (Task 2)
- [ ] Fix scenarios services->components violation (1)
- [ ] Fix outside->non-facade violations in views/ and app.config.ts (9)
- [ ] Re-export shared/'s dumb components through shared/facade.ts, fix remaining cross-feature violations (20)
- [ ] Fix components->stores violations in metricsBar (25)
- [ ] Fix components->stores violations in sidebarExplorer (10)
- [ ] Fix components->stores violations in the remaining 11 features (22 total)
- [ ] Flip rules to `error` (if landed as `warn`) once all violations are cleared
- [ ] `npm run lint:architecture` clean

## Notes

- Investigation used a scratch dependency-cruiser config (not committed) run via `node_modules/.bin/depcruise app --config <scratch> --output-type err-long`; no repo files were changed during investigation.
- Baseline (`npm run lint:architecture` today): clean, 0 violations.
