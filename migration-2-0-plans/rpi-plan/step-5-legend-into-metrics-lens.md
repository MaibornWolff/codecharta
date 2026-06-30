---
name: migrate-legend-into-metrics-lens
issue:
state: todo
version: 2
---

## Goal

Move `features/legend` to `lenses/metrics/features/legend` and collapse its 9 passthrough `*Service`
+ 9 `*Store` classes onto the metrics-lens repos (step 4) plus ONE real view-model service. Components
read only the service; the service reads the repos (reactive forms). Behavior and snapshots stay
identical — the proof slice that a feature can live inside the metrics lens.

## Tasks

Current shape (`features/legend/`): `facade.ts` (re-exports `LegendPanelComponent`),
`components/legendPanel/*` (panel + toggle + metricsSection, metricRow, colorScaleSection,
deltaColorsSection, edgeColorsSection, colorRow + `legendPosition.ts`), `services/*` (9 one-line
passthroughs), `stores/*` (9 one-line `store.select(...)` wrappers). Only external importer:
`codeCharta.component.ts` (`./features/legend/facade`).

### 1. Move the folder + fix ALL relative imports (structural, Tidy First — commit alone)
- `git mv features/legend lenses/metrics/features/legend` (preserves history; specs move with it).
- Update the single external import in `codeCharta.component.ts` →
  `./lenses/metrics/features/legend/facade`.
- Fix the now-deeper relative imports inside the moved files (this includes the moved **spec** import
  paths — they are structural, they belong in this commit, not Task 4):
  - paths that reach `app/codeCharta/*` from `components/legendPanel/` gain two levels
    (`../../../../` → `../../../../../../`).
  - the cross-feature `InspectorVisibilityService` import is `../../../sidebarInspector/facade`
    (stops AT `codeCharta/features`, an intermediate dir) → the new file is 6 segments deep
    (`lenses/metrics/features/legend/components/legendPanel`), so it becomes
    **`../../../../../../features/sidebarInspector/facade` (six `../`)** — the generic "+2 levels"
    heuristic is wrong for this one. It is imported by **three** files:
    `legendPanel.component.ts`, `legendToggleButton.component.ts`, and `legendPanel.component.spec.ts`.
  - `components/legendPanel/legendPosition.ts` consumers (`legendPanel.component.ts`,
    `legendToggleButton.component.ts`) when it moves into `models/` (Task 2).
- No behavior change. `npm test` + dependency-cruiser; commit.

### 2. Adopt the lens-feature shape (facade · models · components · services) — structural
- Keep `facade.ts` re-exporting `LegendPanelComponent` (the lens's public mount surface —
  `lens-external-access-only-via-public-surface`).
- Add `models/`: move `legendPosition.ts` (`LEGEND_BARS_OFFSET`) into it. No new range type needed —
  step 4's `rangeOf`/`selectedColorMetricData$` already emit the exact `MetricMinMax`
  `{ values, minValue, maxValue }` shape colorRow consumes today, so it is a **drop-in** (no field remap).

### 3. Collapse the 18 passthroughs onto the metrics facade + ONE view-model service (behavioral)
- Create `services/legend.service.ts` (`LegendService`) — the single seam every legend component
  injects. Delete all 9 `services/*.service.ts` and all 9 `stores/*.store.ts`.
- Metric DATA comes from the metrics-lens facade's **observable** forms (the facade exposes both sync
  and reactive — step 4 Task 4 — so reactivity is resolved; `LegendService` reads the facade, never the
  store, satisfying `feature-services-read-repos-not-store`):
  - `selectedColorMetricData$` = `metricsLensFacade.selectedColorMetricData$` (i.e. `rangeOf$(colorMetric)`).
  - `attributeDescriptors$` = `metricsLensFacade.descriptors$`.
- The remaining 7 reads are view/appearance settings (NOT metrics, no 2.0 home this slice):
  `colorMetric`, `areaMetric`, `heightMetric`, `edgeMetric`, `colorRange` (viewState), `mapColors`
  (appearance), `isDeltaState`. `LegendService` keeps them as **documented temporary** direct reads of
  the existing global selectors (this re-introduces `@ngrx`-in-service, allowed at `warn` until those
  slices land). Note `selectedColorMetricData$` already self-selects `colorMetric` inside the facade,
  so the service does not need to re-combine it.
- Expose each as a signal/stream so component bodies stay 1:1 with today.

### 4. Repoint components; keep snapshots green (behavioral)
- Replace per-concern service injections with the single `LegendService` in `legendColorRow`,
  `legendMetricRow`, `legendMetricsSection`, `legendEdgeColorsSection`, `legendPanel`.
- Specs: they drive components via `provideMockStore` + `overrideSelector(...)`. Green-ness is
  **contingent on step 4 reusing the existing `attributeDescriptorsSelector`** (it does — step 4 Task 1)
  and on step-4 `rangeOf` **parity** on `defaultState` (empty selection); the legend specs use
  `provideMockStore({initialState: defaultState})` with no override for the color range, so they pass via
  that parity, not via a shared selector. State this contingency; no new mock wiring is needed.

### 5. Boundary check + verification
- `npm run lint:architecture`: the scoped metrics-lens rules (added at `warn` in step 1) pass —
  components→`LegendService`→facade, no component importing repos/store; the 7 settings reads keep
  `@ngrx`-in-service at `warn`.
- `npm test` (full suite + the three legend snapshot/spec files); `npm run format:check` from the repo root.

## Steps

- [ ] Complete Task 1: move folder + fix all relative imports incl. specs + the 6-`../` inspector path (structural commit)
- [ ] Complete Task 2: facade/models/components/services shape; move `legendPosition.ts` into `models/`
- [ ] Complete Task 3: one `LegendService` reading the facade's observable forms; delete the 9+9 passthroughs
- [ ] Complete Task 4: repoint components; snapshots green (contingent on step-4 parity)
- [ ] Complete Task 5: dependency-cruiser + `npm test`/format green (behavioral commit)

## Review Feedback Addressed

1. **Reactive mismatch (C6)**: legend reads the facade's **observable** forms (`selectedColorMetricData$`,
   `descriptors$`) built in step 4 — no impedance gap.
2. **Relative-path bug**: the `sidebarInspector` import needs **six** `../`, not five; listed all three
   importers (incl. `legendToggleButton`).
3. **Spec rationale corrected**: green-ness is contingent on step-4 parity + reused
   `attributeDescriptorsSelector`, not on "reading the same selectors".
4. **Tidy-First leakage**: moved spec path-fixes into the structural Task 1.

## Notes
- Depends on step 4: `metricsLens.facade.ts` (`selectedColorMetricData$`, `descriptors$`,
  `rangeOf`) must exist before the collapse.
- `InspectorVisibilityService` (used by `legendPanel`/`legendToggleButton` for positioning) lives in
  `sidebarInspector`→shell; once `lens-no-ui-dependency` is enforced this trips it, so it must move to
  interaction/appearance in a later slice — keep behavior identical now, do not fix here (rule stays `warn`).
- The 7 view/appearance settings reads make `LegendService` import `@ngrx/store`, so the
  `metrics-lens-ngrx-guard` stays at **`warn`** — and **step 7 deliberately does NOT flip it to `error`**
  (it flips the other 7 rules). It is promoted to `error` in the later slice that builds
  `viewState`/`appearance` and removes this temporary bridge.
- **Rollback:** revert the behavioral commit (Tasks 3-4) to restore the 18 passthroughs while keeping
  the structural move; or revert both commits to return legend to `features/legend`.
