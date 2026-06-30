---
name: enforce-and-verify
issue:
state: todo
version: 1
---

## Goal

Close Slice 1 by flipping the metrics-lens / fileStore dependency-cruiser boundaries to `severity: "error"` so they are enforced for good, then prove the migration is behavior-preserving: architecture lint, unit + snapshot, and e2e suites all green, with the **render-pipeline Jest snapshots byte-identical** (the repo's render proof — there is **no** Playwright image-baseline suite, so "render unchanged" means those snapshots are unchanged). This step is the gate — it lands last, after steps 1–6 have repointed every consumer.

## Tasks

### 1. Promote the metrics-lens boundaries to `error` in `visualization/.dependency-cruiser.js`
Edit the single live config `visualization/.dependency-cruiser.js` (run by `npm run lint:architecture` → `depcruise app --config .dependency-cruiser.js`). **After steps 1–6**, `lenses/metrics/`, `fileStore/`, and `model/` exist (they do **not** exist on the pre-Slice-1 branch); `renderers/`, `shell/`, `interaction/`, `appearance/`, `components/` do not (later slices). This step does not *add* new rules — it **flips the exact 8 rules step 1 staged at `warn` to `error`**, one-for-one, plus swaps the wire-DTO rule.

- Keep every existing `features/*` rule unchanged — metricsBar, sidebarInspector, codeMap, navBar still live under `features/` this slice (`feature-no-external-access-to-internals`, `feature-cross-feature-only-via-public-api`, `feature-types-cannot-import-from-feature-internals`, `feature-no-circular-dependencies-between-features`, `feature-only-stores-can-import-ngrx-store`).
- **Flip these `warn`→`error`** — the complete set staged in step 1 Task 3 (enumerate every one so none is silently left at `warn`):
  - `lens-external-access-only-via-public-surface` — the load-bearing one: outside code (the still-`features/` metricsBar / inspector / codeMap repointed in step 6) may touch `lenses/` only via `lenses/<lens>/<lens>.facade.ts` or `lenses/<lens>/features/<f>/components/`.
  - `lens-no-ui-dependency` — `lenses/` must not import `renderers/` or `shell/` (inert today, but it's a lens-boundary rule; flip it).
  - `lens-cross-lens-only-via-facade` and `lens-feature-cross-only-via-public-api` — harmless today (only `metrics` + `legend`) but flip so they bite when a second lens/feature lands.
  - `feature-components-go-through-services` — legend components must not import the metrics `repos/`/`store/`.
  - `feature-services-read-repos-not-store` — legend services read the repo, never the lens store.
  - `filestore-has-no-upward-deps` — `fileStore/` must not import `lenses/` (the renderers/shell/interaction/appearance targets are inert — those dirs are absent).
  (Leave the existing `feature-only-stores-can-import-ngrx-store` in place; the rest of the app still owns ngrx in `features/*/stores`. Do **not** adopt the global `only-state-holders-import-ngrx-store` — it lacks the `features/` exemption and would break every `features/*/stores`.)
- **Keep `metrics-lens-ngrx-guard` at `warn` this slice (do NOT flip it to `error`).** `LegendService`
  reads 7 view/appearance settings (`colorMetric/areaMetric/heightMetric/edgeMetric/colorRange/mapColors/
  isDeltaState`) directly from the global selectors as a **documented temporary bridge** — those settings
  have no 2.0 home until the `viewState`/`appearance` modules land. Flipping this rule to `error` now would
  fail the gate on that intentional bridge. Flip it to `error` in the slice that builds `viewState`/`appearance`
  and removes the bridge.
- **Also keep `new-must-not-import-legacy` at `warn` (do NOT flip).** The new structure still has
  documented transitional edges into legacy this slice — the legend's `features/sidebarInspector/facade`
  import, `errorDialog` from `features/shared/components/`, `fileStore`'s `loadInitialFile` dispatching
  into `state/store/*`, and the metrics store reading `blacklistMatcherSelector` from `state/`. It flips
  to `error` when `state/`→`interaction`/`appearance` and the inspector dependency relocates.
- So this gate flips **7** rules to `error` and leaves **2** at `warn`
  (`metrics-lens-ngrx-guard`, `new-must-not-import-legacy`).
- **No `components-are-dumb-primitives` rule** is touched — there is no `components/` dir this slice (step 1 did not add it). Step 1 and step 7 agree on this.
- **Swap the wire-DTO rule:** by now step 3 already **modified** `wire-dto-only-in-serialization-boundary` (its `pathNot` lists `fileStore/`, not the dead `features/loadFile/`). Swap that to the 2.0 `wire-dto-only-in-filestore-boundary` form and **reconcile the allow-list against the real importer set** — confirm with `depcruise app --include-only 'codeCharta.api.model' --config .dependency-cruiser.js`: the live importers are `fileStore/*` (the moved pipeline), `features/navBar/util/gameObjectsParser/gameObjectsImporter.ts`, `util/fileDownloader.ts`, plus mocks/resources/specs. (**Not `model/`** — nothing under `model/` imports `api.model`, and step 1 forbids `model/ccjson2.model.ts` from importing it; do not add `model/` to the allow-list.) Nothing under `features/loadFile/` may import it (it moved in step 3). Keep the `gameObjectsParser` exemption explicitly.
- Keep `no-circular` (warn), `no-orphans` (info), `no-component-scss-files`, `no-angular-material` as-is (identical across both configs).
- Optional polish: extend the `archi` reporter `collapsePattern` to also collapse `lenses/[^/]+` and `fileStore` so the architecture graph reads correctly.

### 2. Run the full verification gate and confirm pixel-identical render
- `npm run lint:architecture` → zero `error` violations (warnings for `no-circular` are pre-existing and allowed).
- `npm test` (Jest unit + snapshots; use `dangerouslyDisableSandbox: true`). The render-pipeline snapshots are the golden/pixel proof in this repo (there is **no** Playwright image-baseline suite): `app/codeCharta/features/codeMap/rendering/__snapshots__/rendering.spec.ts.snap`, `app/codeCharta/features/codeMap/__snapshots__/codeMap.render.service.spec.ts.snap`, and the treemap-layout snapshots under `app/codeCharta/util/algorithm/treeMapLayout/__snapshots__`. They MUST stay byte-identical — geometry + vertex colors unchanged ⇒ identical render. **Do not** run `npm run test:updateSnaps`; an updated snapshot here means a behavioral regression, not an expected change.
- `npm run e2e` (Playwright; also `npm run e2e:ci` for the sequential single-worker run) → green.
- Manual smoke: load a real cc.json 2.0 fixture and a legacy file converted by the analysis `convert` tool; confirm both render and the Legend (now inside the metrics lens) shows the same Area/Height/Color/Edge mapping and ranges as `main`.

### 3. Document and define rollback
- Update `visualization/CHANGELOG.md` under `## [unreleased]` (this is the visualization changelog — root has none): add a Chore entry for the cc.json 2.0 metrics-lens enforcement (boundaries now `error`) and a short Changed/Added line summarizing Slice 1 (app reads cc.json 2.0; metric data flows through the `MetricsLens` facade; Legend lives in `lenses/metrics/features/legend`). Keep it one slice-level summary, not a per-step diary.
- Docs: the standalone schema `dev_docs/cc-json-2.0.schema.json` already exists (no change). Update the in-repo architecture note / README that describes the dependency-cruiser layering so it mentions the new `lenses/` + `fileStore/` boundaries; reference `Ideas/codecharta-2.0-implementation-map.html` as the target map.
- Record rollback in `## Notes` (below): this step is config + docs only.

## Steps

- [ ] Complete Task 1: Promote the metrics-lens / fileStore boundaries to `error` in `.dependency-cruiser.js` (scoped to existing dirs; wire-DTO rule swapped + allow-list reconciled)
- [ ] Complete Task 2: Run `npm run lint:architecture`, `npm test`, `npm run e2e` (+ `e2e:ci`); confirm render snapshots unchanged and manual 2.0/converted load is pixel-identical
- [ ] Complete Task 3: Update `visualization/CHANGELOG.md` + architecture docs; record rollback

## Review Feedback Addressed

1. **dep-cruiser staging (C4)**: step 7 now flips **all 8** step-1 warn rules one-for-one (incl.
   `lens-no-ui-dependency` and `metrics-lens-ngrx-guard`, which is staged at `warn` in step 1, never
   jumping straight to `error`). No `components-are-dumb-primitives` rule — there is no `components/`
   dir this slice; step 1 and step 7 agree.
2. **Overclaim (C7)**: "only `lenses/`/`fileStore/`/… present (verified)" corrected to "after steps 1–6"
   (they don't exist on the pre-slice branch).
3. **Wire-DTO state (C5)**: acknowledges the rule was already step-3-modified; reconciles the real
   importer set (`fileStore/`, `gameObjectsParser`, `fileDownloader`, model/mocks/resources); nothing
   under `features/loadFile/` remains.
4. **DoD vocabulary**: "golden / pixel-identical" restated as render-pipeline Jest snapshot byte-identity.

## Notes

- **Tidy First (structural vs behavioral):** this step ships **no runtime code** — only a severity flip / rule swap in `.dependency-cruiser.js` plus CHANGELOG/docs. It is a structural/gate change; commit it on its own (`chore(visualization): enforce metrics-lens boundaries`), separate from any behavioral work in steps 1–6. It must land **last**: flipping to `error` before the consumers are repointed would fail the lint.
- **Why it can only be a gate:** all behavior-preserving moves happened in steps 1–6; if `npm test` snapshots or e2e go red here, the regression lives in an earlier step — fix it there, don't mutate snapshots.
- **Scope guard:** do not add renderer/page/shell/interaction/appearance/components rules — those dirs don't exist after Slice 1 (only `lenses/metrics/`, `fileStore/`, `model/` were created, by steps 1/3/4/5). Do not touch other lenses (dependency/structure/terms) — out of scope.
- **Rollback:** the change is one config file + changelog/docs, so rollback is a single-file `git revert` with zero runtime impact. To unblock CI without a full revert (e.g. a late-surfacing violation), temporarily downgrade the offending new lens/fileStore rule's `severity` from `error` back to `warn`, ship the real fix, then re-flip to `error`. Reverting `.dependency-cruiser.js` to its previous `features/`-only form fully restores the pre-Slice-1 gate.
- Verification commands: `npm run lint:architecture`, `npm test`, `npm run e2e`, `npm run e2e:ci` (all from `visualization/`).
