---
name: viz-2.0-slice-11-legend-rehome
issue:
state: complete
version: 1
---

## Goal

Re-home the legend out of the abandoned "features-in-lenses + shell" model: `git mv`
`lenses/metrics/features/legend/` → `features/legend/`, rewire it to read through the mapState +
metrics-lens FACADES (no in-code ngrx `Store` injection outside a `stores/` folder), and flip the
`metrics-lens-ngrx-guard` dep-cruiser rule `warn → error` — `legend.service` is the last lens-code
ngrx injection. Behavior-preserving (snapshots byte-identical throughout).

## Key constraint (drives the commit order)

`feature-only-stores-can-import-ngrx-store` is **error**: a `features/<x>/services|components` file
may NOT import `@ngrx/store`. So legend.service's `Store` injection must be relocated into a legend
`stores/` folder BEFORE the git mv, else the move creates a new error. Order is therefore forced:
rewire-in-place → move → flip.

## Tasks

### 1. Rewire in place (still under lenses/) — clears the guard warning
- New `lenses/metrics/features/legend/stores/`:
  - `isDeltaState.store.ts` — inject `Store`, expose `isDeltaState$ = store.select(isDeltaStateSelector)`
    (mirror `features/metricsBar/stores/isDeltaState.store.ts`; legacy `state/` read, no 2.0 home).
  - `legendMapState.store.ts` — inject `Store`, expose the 6 mapState observables (area/height/color/
    edge metric, colorRange, mapColors) via `mapState.facade` selectors.
- `legend.service.ts`: drop `Store` + the mapState/isDeltaState selector imports + the two
  `lenses/metrics/repos/` imports. Inject `MetricsLensFacade` (its `selectedColorMetricData$` +
  `descriptors$` are the SAME observables the repos exposed — value-identical) + the two new stores.
  Public method surface (`areaMetric$()` … `isDeltaState$()`, `selectedColorMetricData$()`,
  `attributeDescriptors$()`) unchanged, so every legend component is untouched.
- This removes the `@ngrx/store` import from legend.service → the sole `metrics-lens-ngrx-guard`
  violation is gone (the new `stores/` are exempt via the rule's `lenses/*/features/*/stores/` pathNot).
- Verify: tsc, snapshots identical, legend specs green.

### 2. Structural git mv → features/legend/
- `git mv lenses/metrics/features/legend features/legend`; fix the internal relative-import depths
  (one level shallower) in every moved file; repoint the ONE external consumer
  (`codeCharta.component.ts:13`, deep import) — ideally to `features/legend/facade.ts`.
- Post-move edges are all allowed: service→`mapState.facade`/`metricsLens.facade` (facades),
  components→`features/sidebarInspector/facade` (cross-feature via public API), →`state/` (features
  may read state). Verify tsc + snapshots + specs, and dep-cruiser shows the legend feature clean.

### 3. dep-cruiser flip + docs
- Flip `metrics-lens-ngrx-guard` `warn → error` (0 violations now legend is out of lenses). Update its
  comment (no longer "until legend re-home"). Add `feature-services-reach-a-lens-only-via-its-facade`
  (a feature service must reach a lens only via its `<lens>.facade`, not `repos/`/`store/`) per roadmap.
- Re-evaluate CF #4 (metricSelectPopover + metricColorRangeDiagram in `features/metricsBar/`): **defer**
  — they are metricsBar-owned cross-lens UI, out of scope for a legend slice; moving them would muddy
  commit boundaries. Record the re-evaluation on CARRIED-FORWARD, keep #4 open.
- `new-must-not-import-legacy` does NOT fully flip here (other edges remain); note the legend edges it
  loses.

## Steps

- [x] Complete Task 1: rewire in place (stores + service), guard warning cleared (commit `e056b794b`)
- [x] Complete Task 2: git mv legend → features/legend/ + repos→facade + repoint (commit `d319676d1`)
- [x] Complete Task 3: dep-cruiser flip + CF #4 re-evaluation + docs

## Review Feedback Addressed

1. **`lens-internals-do-not-use-own-lens-facade` (error) caught mid-rewire**: swapping legend.service to
   `MetricsLensFacade` while legend was STILL inside the lens violated this rule. Reordered so the
   repos→facade swap lands with the git mv (once legend is an outside consumer), not in step 1.
2. **New rule not needed**: the roadmap's proposed `feature-services-reach-a-lens-only-via-its-facade` is
   already subsumed by the `error`-level `lens-external-access-only-via-public-surface` (outside code may
   touch a lens only via its facade / a feature's components — never services/repos/stores). Not added.
3. **CF #4 → HOLD**: the original target (`lenses/metrics/features/`) is the very model this slice deleted.
   `metricSelectPopover`/`metricColorRangeDiagram` already live in `features/metricsBar/` and read the lens
   only via `MetricsLensFacade`, so they are boundary-clean; no move without a future single-lens-UI home.

## Notes

- Behavior-preserving end to end — snapshots are the contract, never `-u`.
- Scout map: scratchpad `slice-11-scout.md`. Only ONE legend consumer; `legend/facade.ts` barrel
  currently imported by nobody (repoint the consumer to it).
- The legend↔inspector coupling (`legendPanel.component.ts` reads `InspectorVisibilityService` +
  `--cc-inspector-width`) STAYS — it's an allowed cross-feature-via-facade import; "killing the shell"
  is the folder move + losing the label, not removing that coupling.
