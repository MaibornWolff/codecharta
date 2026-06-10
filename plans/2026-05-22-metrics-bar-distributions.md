---
name: metrics-bar-distributions
issue: ""
state: progress
version: 1.142.0
date: 2026-05-22
git_commit: 7708617904d4310f0896fc9b9f666235d6eab2f6
branch: fix/explorer-sort-dropdown-auto-close
topic: "Metrics Bar — variant 02 Distributions restyle"
tags: [plan, visualization, metricsBar, daisyui, signals, zoneless]
---

# Metrics Bar — variant 02 Distributions restyle

## Goal

Restyle the floating metrics bar (`features/metricsBar`) to match variant **02 · DISTRIBUTIONS** in `RestyleImages/metrics-bar.html`: every axis carries its own micro-histogram, COLOR is highlighted with a primary tint and shows the actual ramp inside its bars, EDGES gets a coupling-strength gauge, LABELS gets chip rows, the link button shows a linked/unlinked ring, and SCENARIO gets a headline + saved chip.

Every new component lives under `features/metricsBar/components/`, uses OnPush + signals, no Zone.js reliance, no `async` pipe, and leans on Tailwind/DaisyUI utility classes — custom SCSS only where utility classes literally cannot express the visual.

## Overview

```
┌──────────────┬──────────┬──────────┬──┬──────────┬──────────┬─────────┐
│ ▣ SCENARIO   │ ▢ AREA   │ ▦ HEIGHT │  │ ● COLOR  │ ⋈ EDGES  │ Aa LBL  │
│ MapName ▾    │ rloc     │ complex- │ ⊙│ complex- │ temporal │ color   │
│ [ 11 saved ] │          │ ity      │  │ ity      │ _coupling│         │
│              │ ▁▃▆█▆▃▂▁ │ █▇▅▃▂▁   │  │ ▇▆▅▄▃▂▁ │ ━━━━░░  │ [top 10]│
│              │ 0  Σ 133 │ 0  Σ 25k │  │ low 5 hi│ 2,443 / │ [folder]│
│              │ k  1,435 │ 542      │  │ breaks  │ 2,443   │ [files] │
└──────────────┴──────────┴──────────┴──┴──────────┴──────────┴─────────┘
                                       ↑ primary-tint when COLOR is the active encoding
                                       ↑ link button: primary-ring when linked, dashed when not
```

## Current State Analysis

- `MetricsBarComponent` (`features/metricsBar/components/metricsBar/metricsBar.component.ts:18-44`) is a flex container that composes six segment components. Already OnPush + signals, already zoneless-friendly.
- Each axis segment (`areaSegment`, `heightSegment`, `colorSegment`, `edgeSegment`, `labelsSegment`, `scenarioSegment`) reuses the generic `MetricSegmentComponent` shell (`components/metricSegment/metricSegment.component.ts:9-42`) which renders **label → name → meta-slot → optional cog**. Today every segment crams Σ, range, hovered-node value into the meta slot, so there is no room for a distribution.
- `MetricMetaValueComponent` shows the hovered-node value next to a delta-vs-baseline pill. This is **valuable** and must survive the restyle — the mock doesn't show it but the existing behaviour (hover a building, see its rloc / complexity value) is non-negotiable.
- The link button (`linkColorHeightButton.component.ts:8-25`) is a plain DaisyUI ghost circle with a chain icon. No visual "linked" affordance beyond the icon swap.
- `metricDataSelector` already exposes `nodeMetricData.values: number[]` and `edgeMetricData.values: number[]` — raw distributions are available without new state.
- COLOR ramp inputs are already in the store:
  - `colorRangeSelector` (`{ from, to }`) — `state/store/dynamicSettings/colorRange/colorRange.selector.ts`
  - `mapColorsSelector` (positive / neutral / negative) — `state/store/appSettings/mapColors/mapColors.selector.ts`
  - `colorCategoryCounts$` BehaviorSubject — `ui/codeMap/codeMap.render.service.ts:36` — gives `{ positive, neutral, negative }` counts for the "N breaks" stat.
- EDGES gauge inputs are already in the store:
  - `amountOfBuildingsWithSelectedEdgeMetricSelector` — total candidates
  - `amountOfEdgePreviewsSelector` — how many are actually previewed
- `metricsBar.component.spec.ts` covers three rendering cases; the test setup already mocks `colorCategoryCounts$` on `CodeMapRenderService`, so the COLOR axis can subscribe to it without test changes.
- **No active-scenario state** — `scenarioSegment.component.ts` only knows the total count of saved scenarios. The mock's "Complexity ✕ Coverage" headline + pills row don't have backing state today.

## Desired End State

- The floating bar matches variant 02 visually:
  - Each axis: glyph icon + uppercase label + cog (hover only) + metric name + 12-bin √-scaled histogram + footer (min / Σ / max).
  - COLOR axis: DaisyUI `primary` tint background; histogram bars colored from `colorRange` × `mapColors`; footer is `low / N breaks / high`.
  - EDGES axis: replaces "X / Y · A / B" ratio with a horizontal strength gauge bar and `previewed / total edges` footer.
  - LABELS axis: shows chips for `top N`, plus an inactive chip for the non-active label mode.
  - SCENARIO pane: headline is the currently selected map name (`filesSelector` first visible file); single chip = `N saved`. Cog opens scenario list dialog as today.
  - Link button: shows a DaisyUI `primary` ring when linked, dashed neutral ring when not.
- COLOR axis is **always** primary-tinted whether or not it mirrors HEIGHT — it is the active visual encoding regardless.
- Every new component: standalone, OnPush, signals (`toSignal` / `computed`), no `async` pipe, no Zone-tracked subscriptions, no `mat-*` imports, host class uses Tailwind/DaisyUI only.
- Bar grows ~24px taller (per the mock). No other UI moves; the bar already centres on `bottom: calc(var(--cc-bottom-bar-height, 32px) + 12px)`.
- Hovered-node value still appears on the relevant axis (small overlay row), so existing UX is not regressed.

## What We're NOT Doing

- **Not introducing an "active scenario" concept.** No new state slice; SCENARIO headline is the current map name, chip stays "N saved".
- **Not adopting Inter / JetBrains Mono.** Bar uses the app's existing font stack (Roboto). The mock's typography is treated as a style direction only, not literal.
- **Not introducing a metric-bar-scoped accent token.** All highlights use existing DaisyUI tokens (`primary`, `base-200`, `neutral-content`, etc.).
- **Not redesigning the popovers** (`areaSettingsPopover`, `colorSettingsPopover`, `edgeSettingsPopover`, `heightSettingsPopover`, `metricSelectPopover`). They keep working as-is.
- **Not removing `MetricMetaValueComponent`.** It keeps rendering the hovered-node value; we move it inside the new axis layout, not into the deleted "meta" slot.
- **Not refactoring `MetricSegmentComponent`** beyond what's needed. We deprecate it by leaving it untouched and routing the new axis segments through a new `axisCard` shell. The remaining consumer (delta-state placeholder for COLOR) keeps using it.
- **Not changing the color computation pipeline** — bin colors are computed in the COLOR axis from existing selectors; the 3D map's coloring is unchanged.

## UI Mockups

### Today (recreated)

```
┌────────┬────────┬─────────┬─┬────────┬────────┬──────┐
│SCENARIO│ AREA ⚙ │HEIGHT ⚙ │⊙│COLOR ⚙ │EDGES ⚙ │LABELS│
│ +      │  rloc  │complex. │ │complex.│tempor. │color │
│11 saved│Σ 133.8 │Σ 25.203 │ │Σ25.203 │2.4/2.4 │top-10│
│        │0-1.435 │0 - 542  │ │0 - 542 │1 / 90  │      │
└────────┴────────┴─────────┴─┴────────┴────────┴──────┘
```

### After

```
┌──────────────┬──────────┬──────────┬──┬┄┄┄┄┄┄┄┄┄┄┄┄┐
│▤ SCENARIO    │▢ AREA  ⚙ │▦ HEIGHT⚙ │⊙ │●  COLOR  ⚙ │ ←┐ primary
│ map.cc.json▾ │ rloc     │ complex. │  │  complex.  │  │ tinted
│              │          │          │  │            │  │ background
│              │ ▁▃▅█▇▅▃▁ │ █▇▅▃▂▁▁  │  │ ▇▅▃▂▁▁▁    │
│ ┌──────────┐ │ 0 Σ133K  │ 0 Σ25K   │  │ low 5  high│
│ │11 saved  │ │   1,435  │   542    │  │     breaks │
│ └──────────┘ │          │          │  │            │
└──────────────┴──────────┴──────────┴──┴────────────┘
                                       ↑ link button
                                         ⊙ = linked (primary ring)
                                         ⊙⃝ = unlinked (dashed neutral)

┌──────────┬────────────┐
│⋈ EDGES  ⚙│Aa LABELS  ⚙│
│tempor_c. │ color      │
│          │            │
│STRENGTH≥1│ [top 10]   │
│━━━━━░░░░ │ [folders]  │  ← chip muted if mode == color
│2.4K/2.4K │ [files]    │
│   edges  │            │
└──────────┴────────────┘
```

- ⚙ = cog (only visible on axis hover via Tailwind `group-hover`).
- COLOR ramp bars: each of the 12 histogram bars is filled with the color computed from its bin midpoint via `colorRange` × `mapColors` (positive / neutral / negative).
- EDGES gauge fill ratio: `amountOfEdgePreviews / amountOfBuildingsWithSelectedEdgeMetric`.
- LABELS chips: one active = `top {N}`, one muted = the non-active label mode (`color` vs `height`).

## Architecture and Code Reuse

```
app/codeCharta/features/metricsBar/
  components/
    metricsBar/
      metricsBar.component.{ts,html,spec.ts}        # CHANGE: host taller, otherwise unchanged
    axisCard/                                       # NEW: shared shell for the 6 axes (intentionally untested — thin presentational shell)
      axisCard.component.{ts,html}                  # presentational: glyph + label + cog + body slot + footer slot
    axisDistribution/                               # NEW: 12-bin √-scaled histogram
      axisDistribution.component.{ts,html,spec.ts}
    axisColorRamp/                                  # NEW: histogram + per-bin ramp colors
      axisColorRamp.component.{ts,html,spec.ts}
    edgeStrengthGauge/                              # NEW: horizontal gauge
      edgeStrengthGauge.component.{ts,html,spec.ts}
    linkColorHeightButton/                          # CHANGE: visual states (ring/dashed)
      linkColorHeightButton.component.{ts,html}
    areaSegment/                                    # CHANGE: rewrite html, drop MetricSegment usage
    heightSegment/                                  # CHANGE: rewrite html, drop MetricSegment usage
    colorSegment/                                   # CHANGE: rewrite html, drop MetricSegment usage, always primary tinted
    edgeSegment/                                    # CHANGE: rewrite html — use edgeStrengthGauge
    labelsSegment/                                  # CHANGE: rewrite html — chip row
    scenarioSegment/                                # CHANGE: rewrite html — headline = current map name, single chip
    metricSegment/                                  # KEEP: still used by delta-state COLOR placeholder
    metricMetaValue/                                # KEEP unchanged: moves into axisCard footer slot
  util/                                              # NEW folder
    histogramBins.ts                                # NEW: pure function — values:number[] → 12 √-scaled heights
    histogramBins.spec.ts
```

Reuse without modification:

- `metricDataSelector` — `state/selectors/accumulatedData/metricData/metricData.selector.ts`
- `areaMetricSelector`, `heightMetricSelector`, `colorMetricSelector`, `edgeMetricSelector`
- `colorRangeSelector` (typed `ColorRange = { from: number | null; to: number | null }` per `codeCharta.model.ts:193`), `mapColorsSelector`, `isColorMetricLinkedToHeightMetricSelector`
- `amountOfBuildingsWithSelectedEdgeMetricSelector`, `amountOfEdgePreviewsSelector`
- `CodeMapRenderService.colorCategoryCounts$` (positive / neutral / negative counts) — this is a cross-feature read from `ui/codeMap`, but it is **not a new boundary cross**: `features/metricsBar/services/nodeSelection.service.ts` already imports `CodeMapRenderService`, and `metricsBar.component.spec.ts` already mocks `colorCategoryCounts$` on it. Long-term, the counts could be promoted to a dedicated selector or a metricsBar facade — out of scope for this plan.
- `LabelSettingsFacade.labelMode$()`, `amountOfTopLabels$()`
- All existing popovers (`*SettingsPopoverComponent`, `metricSelectPopover`)
- `filesSelector` for the scenario headline current-map-name lookup

Per-axis flow (signals only, OnPush):

```
metricDataSelector  ──┐
areaMetricSelector  ──┴─► computed currentMetricData ─► values: number[] ─► <cc-axis-distribution [values]=…>
                                                                                          │
                                                                                          └─► histogramBins(values, 12) ─► 12 √-scaled bar heights
```

For COLOR:

```
colorRangeSelector ──┐
mapColorsSelector  ──┼─► computed binColors[12]  ─► <cc-axis-color-ramp [values]=… [binColors]=…>
metricMin/max      ──┘
colorCategoryCounts$ ─► neutral count ─► "{n} breaks" footer
```

For EDGES:

```
amountOfEdgePreviewsSelector              ──┐
amountOfBuildingsWithSelectedEdgeMetric…  ──┴─► computed fillRatio ─► <cc-edge-strength-gauge [ratio]=…>
```

Histogram util (sized for clarity, not for engine reuse):

```ts
// histogramBins.ts
export function histogramBins(values: readonly number[], binCount = 12): number[] {
  // 12 √-scaled normalised heights in [0, 1]; empty/degenerate input → all zeros
}
```

Custom SCSS is avoided: 12 bars use `flex-1 bg-base-content/70 rounded-t-sm` with `style.height.%` driven by signals; COLOR bars use `style.backgroundColor` per bin. The link-button ring uses DaisyUI `ring ring-primary` / `ring ring-dashed ring-base-300`. The only custom rule we expect is one `@layer utilities` declaration in `app.scss` if Tailwind doesn't ship `ring-dashed` natively — added only if confirmed missing during Phase 3.

## Performance Considerations

- Histogram is recomputed only when the metric or its `values[]` reference changes — `computed()` shallow-equals on the signal output.
- 12 bins × 6 axes = 72 DOM rects per render; well below any threshold worth memoising.
- `colorCategoryCounts$` is a `BehaviorSubject` that already pushes on render frames — wrapping it with `toSignal({ initialValue: { positive: 0, neutral: 0, negative: 0 } })` is sufficient; no extra throttling.
- No new selectors hit `metricDataSelector` more than once per axis (same as today).

## Migration Notes

- `MetricSegmentComponent` keeps existing tests passing; only the delta-state COLOR placeholder still uses it. We leave it in place rather than deleting — it's small, and reworking the delta UI is out of scope.
- No state changes, no persisted setting changes, no API changes.
- `CHANGELOG.md` gets one entry under `### Changed` linking the variant 02 mock.

---

## Phase 1: Shared primitives (no UI consumers yet)

Pure foundations: histogram util + three presentational components. After this phase the app looks unchanged.

**Tasks**:
- [x] Add `features/metricsBar/util/histogramBins.ts` — `histogramBins(values: readonly number[], binCount = 12): number[]`. Linear bin edges between `min(values)` and `max(values)`; bar height = `Math.sqrt(count) / Math.sqrt(maxCount)`; returns 12 zeros for empty/degenerate input (all-equal values, single value, NaN-only).
- [x] Add `features/metricsBar/util/histogramBins.spec.ts` — cases:
  - empty input → 12 zeros
  - all-equal input → 12 zeros
  - linear 0..11 input → expected √-scaled heights
  - single outlier dominates max bin
- [x] Add `axisCard/axisCard.component.ts` (OnPush, signals, host class `flex flex-col items-stretch px-3 py-2 transition-colors group`) — inputs: `label`, `metricName`, `glyphTemplate` (`TemplateRef`), `hasCog: boolean`, `cogPopoverId`, `cogAnchorName`, `tinted: boolean`, `testId`, `cogTestId`. Layout: glyph + label + cog row → metric name row → `<ng-content select="[body]">` → `<ng-content select="[footer]">`. Cog only visible on `group-hover`. `tinted` applies `bg-primary/10`.
- [x] Add `axisDistribution/axisDistribution.component.ts` (OnPush, signals) — input `values: number[]`; renders 12 `<div>` bars with `flex-1 bg-base-content/70 rounded-t-sm` and `[style.height.%]="heights()[i] * 100"`. Container `flex items-end gap-px h-6`.
- [x] Add `axisColorRamp/axisColorRamp.component.ts` (OnPush, signals) — inputs: `values: number[]`, `min: number`, `max: number`, `colorRange: { from: number | null; to: number | null }`, `mapColors: MapColors`. Computes per-bin color via the same positive/neutral/negative rule the renderer uses (bin midpoint < from → positive; > to → negative; else neutral; falls back to neutral if range is null). Renders bars identical to `axisDistribution` but with per-bar `[style.backgroundColor]`.
- [x] Add `edgeStrengthGauge/edgeStrengthGauge.component.ts` (OnPush, signals) — inputs: `previewed: number`, `total: number`. Renders an outer `h-1 w-full bg-base-300 rounded` and inner fill `bg-primary` with `[style.width.%]="ratio() * 100"`. Empty (`total === 0`) → no fill, full width neutral bar.

**Automated Verification**:
- [x] `histogramBins.spec.ts` passes.
- [x] `axisDistribution.component.spec.ts` — renders 12 bars; sum of heights matches util output.
- [x] `axisColorRamp.component.spec.ts` — given mock `colorRange={from:5,to:10}` and `mapColors={positive:'#0f0',neutral:'#ff0',negative:'#f00'}`, bins below 5 are positive color, above 10 are negative color, between are neutral.
- [x] `edgeStrengthGauge.component.spec.ts` — `previewed=3, total=10` → fill width 30%; `total=0` → no fill rendered.
- [x] `npm run build` succeeds.
- [x] `npm run format:check` passes.

---

## Phase 2: Restyle the six axis segments

Rewrite each axis segment's template to use `axisCard` + the new primitives. After this phase the bar visually matches variant 02.

**Tasks**:
- [x] **`scenarioSegment.component.ts`** — drop dependency on `MetricSegmentComponent`. Render via `axisCard`:
  - glyph: stacked-lines + dot SVG inline
  - headline: `currentMapName` signal (first visible file via `filesSelector`)
  - footer slot: one chip `{N} saved` (DaisyUI `badge badge-ghost`)
  - cog opens scenario list dialog (existing behaviour).
- [x] **`areaSegment.component.ts` + `.component.html`** — render via `axisCard` with `[tinted]="false"`. Body slot: existing `<cc-metric-meta-value metricFor="areaMetric"/>` then `<cc-axis-distribution [values]="currentMetricData()?.values ?? []"/>`. Footer slot: `0  Σ {sum}  {max}` row (sum = `values.reduce`). Keep `metric-select-popover` and `area-settings-popover` outside the card.
- [x] **`heightSegment.component.ts` + `.component.html`** — same shape as area; glyph = three vertical bars; metricFor `heightMetric`.
- [x] **`colorSegment.component.ts` + `.component.html`** — render via `axisCard` with `[tinted]="true"` (always). Body slot: `<cc-metric-meta-value metricFor="colorMetric"/>` then `<cc-axis-color-ramp [values]=… [min]=… [max]=… [colorRange]=… [mapColors]=…/>`. Footer slot: `low  {neutral} breaks  high` row (neutral count from `colorCategoryCounts$` via `CodeMapRenderService`). Keep `disabled` semantics — when `isLinked()` clicking the body does nothing (popover stays closed) but the tint remains.
- [x] **`edgeSegment.component.ts` + `.component.html`** — render via `axisCard`. Body slot: `STRENGTH ≥ 1` label + `<cc-edge-strength-gauge [previewed]=… [total]=…/>`. Footer slot: `{previewed} of {total} edges`. Keep `disabled` when `!isEdgeMetricVisible()`. Hovered edge value (existing behaviour) moves to a small `text-xs opacity-60` line above the gauge.
- [x] **`labelsSegment.component.ts` + `.component.html`** — render via `axisCard`. Body slot: `top-pick` row = current `labelMode` (`color` or `height`). Footer slot: three chips: `top {N}` (active), `color` (active if labelMode === color, else muted via `badge badge-outline`), `height` (active if labelMode === height, else muted).
- [x] **`linkColorHeightButton.component.{ts,html}`** — visual states only:
  - host stays `self-center px-1`
  - button class: `btn btn-circle btn-sm`
  - when `isLinked()`: add `ring-2 ring-primary text-primary bg-primary/10`
  - when not: add `ring-1 ring-dashed ring-base-300 text-base-content/60`
  - keep `(click)` toggle + title.
- [x] **Update existing segment specs** to match new DOM:
  - `areaSegment.component.spec.ts` (if present) — assert distribution is rendered, footer shows `Σ`.
  - Add specs only where they're missing today; do not invent specs for trivial pass-through components.

**Automated Verification**:
- [x] No `| async` pipe in any new template: `grep -R "| async" --include='*.html' app/codeCharta/features/metricsBar` returns empty.
- [x] No `@angular/material` import under the feature: `grep -R "from \"@angular/material" app/codeCharta/features/metricsBar` returns empty.
- [x] No `provideZone` or explicit `NgZone` usage introduced: `grep -RE "provideZone|NgZone" app/codeCharta/features/metricsBar` returns empty.
- [x] `npm run build` succeeds.
- [x] `npm test -- --testPathPattern=metricsBar` passes.
- [x] `npm run format:check` passes.

---

## Phase 3: Wire host, fix existing tests, verify end-to-end

Stitch the new segments into `MetricsBarComponent`, restyle the host container (taller bar), update the existing spec to the new DOM, manual verification, changelog.

**Tasks**:
- [x] **`metricsBar.component.ts` host class** — keep current `fixed flex bg-base-100 rounded-box shadow-lg border border-base-300 divide-x divide-base-300`. The new axes are taller; the host already grows with content, no explicit height change needed. Confirm via dev server.
- [x] **`metricsBar.component.html`** — unchanged (still composes the six segments + delta-state branch + edges-if-present branch).
- [x] **Update `metricsBar.component.spec.ts`** — keep three existing test cases (they cover default render, delta-state render, edges-present render). Add:
  - when `nodeMetricData` has non-empty `values`, the AREA segment renders at least one bar (`screen.getByTestId('metric-segment-area-distribution')`).
  - delta-state case asserts the new segments still render without throwing (`screen.getByTestId('metric-segment-area-distribution')` + `metric-segment-height-distribution` present; `metric-segment-color-distribution` absent).
  Add testid `metric-segment-{axis}-distribution` to each `<cc-axis-distribution>` host **inside the segment templates** (not the bar host).
- [x] **CHANGELOG entry** under `### Changed`:
  `Metrics bar: redesigned floating bar with per-axis distribution histograms, primary-tinted COLOR axis, edges strength gauge, and clearer link/labels affordances.`
- [x] Sanity grep:
  - `grep -R "<cc-metric-segment" app/codeCharta/features/metricsBar/components` returns only matches in `metricsBar.component.html` (delta-state COLOR placeholder) and `metricSegment` itself.
  - `grep -R "fa-chain" app/codeCharta/features/metricsBar` returns nothing (link button rewritten).

**Automated Verification**:
- [x] `npm run build` succeeds.
- [x] `npm test` passes (full suite).
- [x] `npm run format:check` passes.
- [-] `npm run e2e` passes (no `.e2e.ts` references metric-bar markup today — confirmed by grep; this step is a regression guard, not a fix-up).

**Manual Verification** (`npm run dev`, against a multi-file map with edges):
- [ ] Bar shows six axes with histograms; bars are visible and non-degenerate for `rloc` and `complexity`.
- [ ] COLOR axis has a primary-tinted background and its 12 bars are colored from green → yellow → red (or whatever the current `mapColors` are); the "N breaks" number matches the legend panel's neutral count.
- [ ] Hovering an axis fades the cog in; clicking the cog opens the matching settings popover; clicking the body opens the metric picker popover.
- [ ] Hovering a building on the map updates the per-axis hovered value (`MetricMetaValueComponent` row) for AREA / HEIGHT / COLOR.
- [ ] Link button: click toggles the linked/unlinked visual ring; the COLOR axis stays primary-tinted regardless.
- [ ] EDGES gauge fill width changes when `amountOfEdgePreviews` is increased in the edges popover; the `X of Y edges` text updates.
- [ ] LABELS chips reflect current label mode and `top-N`; switching label mode in the labels panel updates which chip is muted.
- [ ] SCENARIO headline shows the current map filename; chip shows `N saved` matching the scenario list dialog count.
- [ ] Switch to delta mode — the bar still renders without the COLOR axis, the rest of the axes are intact.
- [ ] Browser devtools console: no Zone.js, change-detection, or `ExpressionChangedAfterItHasBeenChecked` warnings introduced by the new components.

---

## Steps

- [x] Complete Phase 1: Shared primitives (no UI consumers yet)
- [x] Complete Phase 2: Restyle the six axis segments
- [-] Complete Phase 3: Wire host, fix existing tests, verify end-to-end

## References

- Visual target: `RestyleImages/metrics-bar.html:818-947` (variant 02 DISTRIBUTIONS)
- Bar host: `app/codeCharta/features/metricsBar/components/metricsBar/metricsBar.component.ts:18-44`
- Segment shell (kept for delta-state placeholder): `app/codeCharta/features/metricsBar/components/metricSegment/metricSegment.component.ts:9-42`
- Hovered-node metric value (kept): `app/codeCharta/features/metricsBar/components/metricMetaValue/metricMetaValue.component.ts:15-67`
- Link button: `app/codeCharta/features/metricsBar/components/linkColorHeightButton/linkColorHeightButton.component.ts:14-25`
- Raw distribution source: `app/codeCharta/state/selectors/accumulatedData/metricData/nodeMetricData.calculator.ts:43-56`
- Color ramp inputs: `app/codeCharta/state/store/appSettings/mapColors/mapColors.reducer.ts:6-13`, `colorRange.selector.ts`
- Edges gauge inputs: `app/codeCharta/state/selectors/amountOfBuildingsWithSelectedEdgeMetric/amountOfBuildingsWithSelectedEdgeMetric.selector.ts:1-39`
- Theme tokens (DaisyUI primary etc.): `app/tailwind.css:1-39`
- Zoneless features memory: `[[feedback_features_zoneless]]`
