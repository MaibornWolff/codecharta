---
name: viz-2.0-slice-12-legacy-boundary-close
issue:
state: complete
version: 1
---

## Goal

Close the last migration import boundary: re-home the **6 residual `new-must-not-import-legacy`
edges** (`(lenses|fileStore)/` → `features/`|`state/`), then flip the dep-cruiser rule `warn → error`.
Behaviour-preserving throughout (snapshots are the contract, never `-u`).

**Numbering note:** this flip was mis-scheduled into "Slice 10 + 11" (both done, yet 6 edges remain), so
it is currently unnumbered. The canonical spine has 12 = CQRS facade split, 13 = renderer/page split. Slot
this as **Slice 12** and bump CQRS→13 / renderer→14, OR treat it as **"11.5 / boundary-close"** — decide
with the user. It has NO ordering dependency on the CQRS or renderer work. It does NOT require dissolving
the `state/` folder (the rule's `from` is only `lenses|fileStore`; `state/→state/` and `features/→state/`
are out of scope) — that fuller `state/` dissolution is a later concern.

## The 6 edges → homes (scoped via 4-agent investigation)

| # | edge | resolution | class |
|---|------|-----------|-------|
| 1,2 | 2× fileStore loaders → `features/shared/components/errorDialog/errorDialog.service` | `git mv` `errorDialog.service.ts` + `errorDialog.model.ts` → **`util/errorDialog/`** (keep `errorDialog.component`+html+po in `features/shared`; it still `register()`s). Repoint 5 runtime importers + specs. | (C) kernel move |
| 3 | loader → `state/effects/updateQueryParameters/metricQueryParameter` | `git mv` the dependency-free enum → **`util/queryParameter/metricQueryParameter.ts`**. Repoint the loader + the `updateQueryParameters.effect` writer + spec. | (C) kernel move |
| 5 | `fileStore/repos/files.repo` → `state/selectors/referenceFile/referenceFile.selector` | `git mv` → **`fileStore/store/referenceFile.selector.ts`** (+ spec); it's a pure files-domain selector over `filesSelector`. Repoint files.repo (→ local `../store/…`) + the navBar re-export/spec. | (A) clean move |
| 4 | loader → `state/loadInitialFile/loadInitialFile.store` (`LoadInitialFileStore`) | Move to a **NEW neutral top-level `load/` layer** — NOT fileStore (it imports `mapState.facade` + `lenses/metrics/metricsLens.load.facade`, which would trip the `error`-level `filestore-has-no-upward-deps`). Only the loader imports it → 1 repoint, no new violations. Add a `load/` dep-cruiser boundary rule. Ideally move `loadInitialFile.service` into `load/` too (larger blast radius via `fileStore.facade`) — optional follow-up. | (B) design |
| 6 | `lenses/metrics/store/metricsLens.store` → `state/selectors/nodeMetricData/nodeMetricData.selector` | **Inversion**: drop the view-aware members from the metrics-lens store/repo/facade (`nodeMetricData$`/`getNodeMetricData`, `selectedColorMetricData$`/`colorMetricRange$`, `availableMetrics*`, `rangeOf*`, `metricRange`); the ~6 `features/`+`state/` consumers (legend.service, export3DMapDialog, codeMap.render.service, 3–4 metricsBar components, loadInitialFile.store) read `nodeMetricDataSelector`/`metricRangeSelector` from `state/selectors/nodeMetricData` directly. Selector STAYS put (out of the rule's `from` scope once the lens stops reading it). | (B) inversion |

## Tasks (split a/b/c — precedent: Slice 9a/b/c, Slice 10 core+10c)

### 12a — clean re-homes (structural, lowest risk)
- Edges 1,2,3,5: `git mv` errorDialog service+model → `util/errorDialog/`; metricQueryParameter → `util/queryParameter/`; referenceFile.selector → `fileStore/store/`. Repoint all importers + specs. tsc/biome/dep-cruiser clean, snapshots byte-identical. (`util/` currently hosts no `@Injectable` — mild convention stretch for errorDialog.service; acceptable since util/ is the only exempt kernel. Alternative: a new top-level `components/` per roadmap line 447 — decide during impl.)

### 12b — the load applier → neutral `load/` layer
- Edge 4: create `app/codeCharta/load/`, `git mv` `LoadInitialFileStore` in, repoint the loader, add a `load/` boundary dep-cruiser rule (may import fileStore + home facades + lens load-facade; must not be imported BY a home/lens/fileStore). Behaviour-preserving (dispatch order + the Slice-10c sorting-skip comment carried as-is). Verify.

### 12c — metrics-lens view-aware inversion + the flip
- Edge 6: trim the lens store/repo/facade of the view-aware outputs; repoint the ~6 consumers to the read-model selectors directly (selectors unchanged → value-identical/memoization-identical; prove parity before deleting the lens members). Then **flip `new-must-not-import-legacy` `warn → error`** (one-line severity) once dep-cruiser shows 0 violations, and **fix its stale comment** (drop "once state/ becomes interaction/appearance"; it flips once the residue is re-homed). Verify + adversarial review.

## Steps
- [x] 12a: clean re-homes (edges 1,2,3,5) — commit `ccfab7990`
- [x] 12b: LoadInitialFileStore → `load/` (edge 4) + `load/` rule — commit `c13de5b3d`
- [x] 12c: metrics-lens inversion (edge 6) → flip the rule + fix its comment — commits `4c135aaf2` (inversion) + `d228cd5e9` (flip)

## Notes
- Behaviour-preserving end-to-end; Tidy First (structural vs behavioral commits), snapshots byte-identical.
- The flip lands ONLY in 12c, after all 6 edges are gone (mirrors how `state-home-is-leaf` flipped only when the last home landed).
- Scoping evidence: 4-agent workflow (errorDialog / loader-state-helpers / state-selector-reads / rule-numbering-safety).

## Outcome (DONE)
- `new-must-not-import-legacy` is now `error` with **0 violations**; dep-cruiser 0 errors overall.
- 12a: `util/errorDialog/`, `util/queryParameter/`, `fileStore/store/referenceFile.selector` (git-mv + repoints).
- 12b: new neutral `app/codeCharta/load/` layer holds `LoadInitialFileStore`; added rule `load-orchestrator-not-imported-by-lower-layers` (homes/lenses/renderers/shell must not import `load/`; the fileStore loader is the sole driver — a follow-up may move the loader in too to drop even that edge).
- 12c: metrics-lens store/repo/facade lost the view-aware surface (`AttributesRepo` deleted); the 5 consumers read `nodeMetricDataSelector`/`metricRangeSelector` from `state/selectors/nodeMetricData` through their own feature stores (`codeMap.render.service`, `Print3DStateAccessStore`, `ColorRange` store/service, `LegendMapStateStore`). Value/memoization-identical (`selectedColorMetricDataSelector === metricRangeSelector`; `getNodeMetricData()` === `nodeMetricDataSelector(state)`).
- Verified: tsc 0, biome clean, dep-cruiser 0 errors, full unit suite 385 suites / 2308 tests green, 45 snapshots byte-identical. Adversarially reviewed (4 lenses + verify): 0 parity/consumer/test/boundary defects.
- Follow-ups (optional, not blocking): move `LoadInitialFileService` loader into `load/` (larger blast radius via `fileStore.facade`); the fuller `state/` → interaction/appearance dissolution stays a later concern (this slice only cleared the `lenses|fileStore` residue).
