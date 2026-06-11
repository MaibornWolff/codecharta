---
name: sidebar-inspector
issue: ""
state: progress
version: 1
date: 2026-06-11
branch: main
topic: "Migrate the attribute sidebar into features/ as the redesigned Inspector"
tags: [plan, visualization, sidebar, inspector, daisyui, signals, zoneless]
---

# Migrate the attribute sidebar to features/sidebarInspector

## Goal

Replace the legacy right-side attribute sidebar (`ui/attributeSideBar/`) with a new `features/sidebarInspector/` feature that follows the dependency-cruiser feature architecture (facade + components as the only public surface, ngrx only inside `stores/`/`selectors/`), uses signals + OnPush (zoneless-compatible), DaisyUI + Tailwind only (no SCSS, no Angular Material), and matches `plans/sidebar/restyled_sidebar.png` restyled with the features color scheme from `app/tailwind.css`.

## Decisions (clarified 2026-06-11)

- **Keep from legacy**: delta mode support, edge metric section, external links (node + attribute descriptor links).
- **Drop**: Σ/median attribute type toggle (`attributeTypeSelector`) and the `.cc.json` file-name line in the header.
- **Visibility**: auto open on building selection, auto close on deselection; the ✕ button deselects the building/folder in the scene (revised per review feedback, was: visual-only close).
- **Metric bars**: severity-coded (DaisyUI `success`/`warning`/`error`) by position in the metric's global range, respecting `AttributeDescriptor.direction === 1` (higher = better, e.g. coverage).
- **Legacy cleanup**: delete `ui/attributeSideBar/**` in the final phase of this migration.

## UI (mockup → new color scheme)

```
┌──────────────────────────────┐  fixed right, w-80, below bars
│ INSPECTOR          selected  │  ← section label + badge + ✕ close
│ services/billing/       ⧉   │  ← parent path (muted) + copy-path button
│ invoice.ts ↗                 │  ← node name (text-primary) + optional node.link
├──────────────────────────────┤
│ METRIC MAPPING               │
│ AREA  ▪  real_lines_of_code  │  ← metric name + descriptor tooltip/link
│          842                 │  ← selected node's value (folders: aggregate)
│ HEIGHT ▲ mcc                 │
│          41                  │
│ COLOR ●  coverage            │  (hidden in delta mode, like metricsBar)
│          62 · inverted       │  ← "inverted" when mapColors.isColorRangeInverted
│ EDGE ⇄   pairingRate         │  (only when an edge metric is set)
│          5/3 (in/out)        │
├──────────────────────────────┤
│ METRICS                      │  ← all node attributes except "unary", alphabetical
│ lines_of_code         842    │     value formatted with thousands separators
│ ████████░░░░░░░░░░░░░░░░     │  ← bar: value ÷ map total (share of map), severity color
│ coverage           62  Δ-4   │  ← delta value in delta mode (mapColors delta colors)
│ ██████████████░░░░░░░░░░     │
└──────────────────────────────┘
```

Folder nodes additionally show the file count after the path ("42 files") and, in delta mode, added/removed/changed counts (Δ+ / Δ− / Δ≈) — parity with the legacy `nodePath` component. Mockup glyphs/red-orange palette are illustrative; use FontAwesome icons (`fa-arrows-alt`, `fa-arrows-v`, `fa-paint-brush`, `fa-exchange`) tinted `text-primary` and DaisyUI semantic tokens throughout.

## Current State Analysis

- Legacy sidebar: `ui/attributeSideBar/` — 350px absolute-positioned right slide-in inside `ui/codeMap/codeMap.component.html:4`, SCSS-styled, AsyncPipe + direct `Store` injection. Shows node header, 4 primary metric cells (node values), secondary metrics list, Σ/median toggle, delta values.
- Visibility: `services/isAttributeSideBarVisible.service.ts` — plain boolean flipped by `ThreeSceneService` `onBuildingSelected`/`onBuildingDeselected` events. Consumed by `codeMap.component` (shifts `cc-view-cube`) and `legendPanel` (layout class).
- `state/selectors/primaryMetrics/` is shared with `features/metricsBar` and **stays**; it imports the `Metric`/`Edge` types from `ui/attributeSideBar/util/` (`primaryMetrics.selector.ts:2,4`) — types must be relocated before deletion.
- Selection state is pure ngrx: `selectedNodeSelector` = `selectedBuildingId` + `idToNode` (`state/selectors/selectedNode.selector.ts`), so visibility can be store-derived; no scene-event subscription needed.
- Reference feature pattern: `features/sidebarExplorer/` and `features/metricsBar/` (facade, stores wrapping ngrx, services exposing observables, components via `toSignal`, OnPush, DaisyUI, host bindings with `--cc-bars-height`/`--cc-bottom-bar-height`).
- Data sources that already exist and are reused unchanged:
  - `selectedNodeSelector`, `isDeltaStateSelector`
  - `primaryMetricNamesSelector` (area/height/color/edge metric names)
  - `metricDataSelector` → `nodeMetricData`/`edgeMetricData` with `minValue`/`maxValue` per metric
  - `attributeDescriptorsSelector` (tooltips, links, `direction`)
  - `mapColorsSelector` (`isColorRangeInverted`, `positiveDelta`, `negativeDelta`)

## What We're NOT Doing

- Not flipping the app to zoneless (`provideZoneChangeDetection()` stays); components are written zoneless-compatible.
- Not keeping the Σ/median toggle. The `attributeTypes` state slice and `updateAttributeType` action stay (used by accumulation logic), but no UI dispatches it anymore — accepted regression per decision.
- Not showing units ("loc", "%") in ranges — attribute descriptors carry no unit information; mockup units are illustrative.
- Not adding collapse/resize/always-visible modes.
- Not changing selection/hover behavior in the 3D scene.

## Architecture

### Folder structure (new)

```
app/codeCharta/features/sidebarInspector/
  facade.ts                            # exports SidebarInspectorComponent, InspectorVisibilityService
  components/
    sidebarInspector/                  # root drawer: positioning, slide transition, sections
    inspectorHeader/                   # INSPECTOR label, "selected" badge, ✕, path block, copy, link, file counts
    inspectorMetricMapping/            # METRIC MAPPING section (composes blocks)
    inspectorMappingBlock/             # one block: label + icon, metric name, range line, inverted flag, edge in/out
    inspectorMetricsList/              # METRICS section (composes rows)
    inspectorMetricRow/                # name, value, Δ, severity bar
  services/
    inspectorVisibility.service.ts     # isVisible signal (selectedNode != null && !manuallyClosed), close()
    inspectorHeader.service.ts         # selected node path/name/link/fileCounts
    inspectorMetricMapping.service.ts  # mapping block view models
    inspectorMetrics.service.ts        # metric row view models
  stores/
    selectedNode.store.ts
    primaryMetricNames.store.ts
    metricData.store.ts
    attributeDescriptors.store.ts
    mapColors.store.ts
    isDeltaState.store.ts
  selectors/
    inspectorMappingBlocks.selector.ts # names + ranges + descriptors + mapColors → MappingBlock[]
    inspectorMetricRows.selector.ts    # node attributes + ranges + deltas + descriptors → MetricRow[]
  util/
    metricSeverity.ts                  # pure: (value, min, max, direction?) → { fraction, severity }
```

### Data flow

```
ngrx Store ── selectors ── stores/* ── services/* ── components (toSignal/computed)
```

View models (computed in memoized `createSelector`s):

```ts
type MappingBlock = {
    kind: "area" | "height" | "color" | "edge"
    metricName: string
    min: number; max: number
    inverted?: boolean                    // color block only
    incoming?: number; outgoing?: number  // edge block only
    descriptor?: AttributeDescriptor
}
type MetricRow = {
    name: string
    value: number
    delta?: number
    fraction: number                      // (value - min) / (max - min), clamped 0..1
    severity: "success" | "warning" | "error" | "neutral"
    link?: string
}
```

### Severity logic (`util/metricSeverity.ts`)

- `fraction = (value - min) / (max - min)`, clamped to `[0, 1]` (folder aggregates can exceed the leaf-derived max).
- Severity by thirds of `fraction`: `< 1/3` → success, `< 2/3` → warning, else error.
- If `descriptor.direction === 1` (higher is better, e.g. coverage), invert the *severity* input (`1 - fraction`); bar length stays value-proportional.
- Degenerate range (`min === max`): full-width bar, `neutral` color.

### Visibility

`InspectorVisibilityService`: `manuallyClosed` signal + selected-building id from `SelectedNodeStore`; `isVisible = selectedNode != null && !manuallyClosed`; `manuallyClosed` resets whenever a new building id is selected. Exported via `facade.ts` so `ui/codeMap` (view-cube offset class) and `ui/legendPanel` (layout class) can consume it — replaces `IsAttributeSideBarVisibleService`, which is deleted.

### Component conventions

Every component: `ChangeDetectionStrategy.OnPush`, standalone `imports`, `inject()`, signals via `toSignal(..., { initialValue })`/`computed`, `@if`/`@for` control flow, no AsyncPipe/SCSS/Material. Root host binding mirrors `sidebarExplorer`:
`fixed right-0 z-[60] w-80 bg-base-100 flex flex-col overflow-hidden shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.15)]`, `top: var(--cc-bars-height, 98px)`, `height: calc(100vh - var(--cc-bars-height, 98px) - var(--cc-bottom-bar-height, 32px))`, slide transition via `translate-x-full`/`translate-x-0` + `transition-transform`. Bars: `h-1 rounded bg-base-300` track with `bg-success|warning|error` fill width `fraction * 100%`. Numbers formatted with `toLocaleString("en-US")`. Section labels (`INSPECTOR`, `METRIC MAPPING`, `METRICS`, `AREA`, …) as muted uppercase tracking-wide text (`text-xs uppercase tracking-widest opacity-60`).

## Tasks

### Phase 1: Scaffold feature + data layer

Pure additions; legacy sidebar keeps rendering.

- [x] Create the folder tree above with `facade.ts`.
- [x] Relocate `Metric`/`Edge` types from `ui/attributeSideBar/util/{metric,edge}.ts` → `state/selectors/primaryMetrics/`; update imports in `primaryMetrics.selector.ts` and the legacy components (legacy files die in Phase 4 but must compile until then).
- [x] Stores wrapping existing ngrx slices (pattern: `features/metricsBar/stores/areaMetric.store.ts`): `selectedNode`, `primaryMetricNames`, `metricData`, `attributeDescriptors`, `mapColors`, `isDeltaState`.
- [x] `util/metricSeverity.ts` pure function (+ spec covering thirds, direction inversion, clamping, degenerate range).
- [x] `selectors/inspectorMappingBlocks.selector.ts`: area/height blocks always; color block omitted in delta mode (mirrors metricsBar); edge block only when an edge metric is set and the selected node has `edgeAttributes` for it (in/out from the node, range from `edgeMetricData`).
- [x] `selectors/inspectorMetricRows.selector.ts`: all `selectedNode.attributes` except `unary`, alphabetical; ranges from `nodeMetricData`; `delta` from `node.deltas` when present.
- [x] Services exposing the view models + header data (path split into parent path / node name, `node.link`, `fileCount` incl. delta counts).
- [x] `InspectorVisibilityService` with signals as described.
- [x] Specs for every store, selector, and service (Arrange/Act/Assert, "should" naming, dataMocks fixtures).

### Phase 2: Build the UI

- [x] `SidebarInspectorComponent` — root drawer with host positioning, transition, three sections.
- [x] `InspectorHeaderComponent` — label row (INSPECTOR + `badge badge-ghost` "selected" + ✕ `btn btn-ghost btn-sm btn-square` calling `visibility.close()`); path block (muted parent path, `text-primary` emphasized node name, `node.link` external-link icon `target="_blank" rel="noopener noreferrer"`); copy-path button (`navigator.clipboard.writeText(path)`, icon swaps to check for ~1.5s); folder file counts + delta counts.
- [x] `InspectorMetricMappingComponent` + `InspectorMappingBlockComponent` — `@for` over mapping blocks; icon per kind tinted `text-primary`; metric name with descriptor tooltip (reuse `attributeDescriptorTooltip` pipe approach) and optional descriptor link; range line `min – max`, `· inverted` suffix on color block, `in/out` counts on edge block.
- [x] `InspectorMetricsListComponent` + `InspectorMetricRowComponent` — name (+ descriptor tooltip/link), right-aligned value, delta value colored with `mapColors.positiveDelta`/`negativeDelta` (legacy parity), severity bar; empty state ("No metrics available") when the node has no attributes.
- [x] Specs for every component (mirror `features/sidebarExplorer` specs with `@testing-library/angular`): header copy/close/link/file counts, mapping block variants (color inverted, edge in/out, delta mode hides color), metric row severity classes and delta rendering, root composition smoke test.

### Phase 3: Mount + integrate

- [x] Mount `<cc-sidebar-inspector>` in `codeCharta.component.html` (sibling of the other features) and add the facade import to `codeCharta.component.ts`.
- [x] `ui/codeMap/codeMap.component.{ts,html}`: replace `IsAttributeSideBarVisibleService` with `InspectorVisibilityService` (facade import) for the `cc-view-cube` `sideBarVisible` class; remove `<cc-attribute-side-bar>` mount.
- [x] `ui/legendPanel/legendPanel.component.{ts,html}`: same service swap; keep the `.isAttributeSideBarVisible` class name (SCSS untouched).
- [x] `features/viewCubeToolbox/services/screenshot.service.ts:81`: exclusion selector `"cc-attribute-side-bar"` → `"cc-sidebar-inspector"`.

### Phase 4: Delete legacy + verify

- [x] Delete `app/codeCharta/ui/attributeSideBar/**` (all components, SCSS, util, selectors).
- [x] Delete `app/codeCharta/services/isAttributeSideBarVisible.service.ts` (+ spec).
- [x] Update `codeMap.component.spec.ts` / `legendPanel.component.spec.ts` for the service swap.
- [x] Residual-reference check: `grep -rn "attributeSideBar\|AttributeSideBar\|isAttributeSideBarVisible" app/` → zero hits (except the kept legend/viewCube CSS class names).
- [x] Add `sidebarInspector.po.ts` + e2e smoke test: click a building → inspector opens showing its path and metrics; ✕ closes it; selecting another building reopens it.

## Steps

- [x] Complete Phase 1: Scaffold feature + data layer
- [x] Complete Phase 2: Build the UI
- [x] Complete Phase 3: Mount + integrate
- [x] Complete Phase 4: Delete legacy + verify

## Verification

Automated (after each phase):
- [x] `npm test` passes
- [x] `npm run build` succeeds
- [x] `npm run format:check` passes
- [x] `npm run lint:architecture` passes (facade/encapsulation, no-SCSS, no-Material, ngrx-only-in-stores rules)
- [x] No `*.scss`, no `@angular/material` imports, no `AsyncPipe` under `features/sidebarInspector/`
- [ ] `npm run e2e:ci` passes (Phase 4) — e2e written (`sidebarInspector.e2e.ts`) but not runnable in this sandbox (Playwright requires the Chrome channel, unavailable on Linux arm64); runs in CI

Manual (`npm run dev`, sample map):
- [ ] Clicking a building slides the inspector in from the right; deselecting (click map background) slides it out; ✕ closes it; selecting another building reopens it with that node's data.
- [ ] Header shows parent path + highlighted node name; copy button puts the full path on the clipboard; `node.link` opens in a new tab; folders show "N files".
- [ ] METRIC MAPPING shows the current area/height/color metric names with global min–max matching the metricsBar ranges; "inverted" appears after inverting colors in the color settings popover; EDGE block appears only with an edge metric selected and shows the node's in/out counts.
- [ ] METRICS lists all attributes alphabetically with formatted values; bar lengths proportional to global range; coverage-like (direction=1) metrics show green when high; legend/view-cube shift while the inspector is open; no overlap with the metrics bar or legend.
- [ ] Delta mode: COLOR block hidden, Δ values colored, folder header shows Δ+/Δ−/Δ≈ counts.
- [ ] No console errors/warnings (popover, change detection, destroyed signals).

## Review Feedback Addressed

1. **METRIC MAPPING values (2026-06-11)**: The mapping blocks initially showed each metric's global min–max range. Revised to show the selected node's value only (buildings: direct value, folders: the decorated aggregate — same data source as the METRICS list).
2. **Bar semantics (2026-06-11)**: Bars initially normalized against the leaf-level min–max range. Revised to show the value's share of the map total (root aggregate): a building with 100 rloc in a 1,000-rloc map fills 10%; folders show their share of the project. Severity thirds (direction-aware) apply to that share; metrics missing on the root render a neutral full bar.
3. **Close deselects (2026-06-11)**: The ✕ button now calls `ThreeSceneService.clearSelection()` + re-render, deselecting the building/folder; visibility is purely derived from `selectedNode != null`, so the manual-close flag was removed.
4. **Empty metrics grouped (2026-06-11)**: Metrics with empty (zero/missing) values previously rendered a full near-black "neutral" bar when the map total was 0. They now render an empty bar, are greyed out, and are grouped in a collapsed "Empty metrics (N)" section below the metrics with values; the neutral fill color for degenerate ranges changed from `bg-neutral` to `bg-base-content/30` (grey).
5. **Comparison-mode toggle (2026-06-11)**: A segmented `map | range` control in the METRICS header switches the bar denominator between share-of-map (value ÷ root aggregate, default) and position within the file-level min/max range. The selector precomputes both bars per row (`mapBar`/`rangeBar`); the mode is a session-only signal in `InspectorComparisonModeService` (not persisted).

## Notes

- Width `w-80` (320px) vs legacy 350px — close to mockup proportions; fixed, no resize.
- Severity thresholds (thirds) are a starting point; the pure `metricSeverity` function makes tuning trivial.
- Folder metric values are aggregates and can exceed the leaf-derived global max → fraction clamped to 1 (full bar).
- Delta value colors reuse `mapColors.positiveDelta`/`negativeDelta` (inline style) for parity with the legacy `metricDeltaSelected` and consistency with the 3D map; everything else uses DaisyUI tokens.
- `state/selectors/primaryMetrics/` stays — `features/metricsBar` consumes it; only the `Metric`/`Edge` type files move there.

## References

- Mockup: `plans/sidebar/restyled_sidebar.png`
- Legacy sidebar root: `app/codeCharta/ui/attributeSideBar/attributeSideBar.component.ts`
- Visibility service to delete: `app/codeCharta/services/isAttributeSideBarVisible.service.ts`
- Selection selector: `app/codeCharta/state/selectors/selectedNode.selector.ts`
- Metric ranges: `app/codeCharta/state/selectors/accumulatedData/metricData/metricData.selector.ts`
- Direction semantics (`direction === 1` = higher is better): `app/codeCharta/state/effects/updateMapColors/updateMapColors.effect.ts:24`
- Feature pattern reference: `app/codeCharta/features/sidebarExplorer/` (drawer host bindings), `app/codeCharta/features/metricsBar/` (stores/services layering)
- Architecture rules: `visualization/.dependency-cruiser.js`
- Theme tokens: `visualization/app/tailwind.css`
- Prior migration plan (style reference): `plans/2026-05-04-sidebar-explorer.md`
