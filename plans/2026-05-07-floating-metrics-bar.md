---
name: floating-metrics-bar
issue: ""
state: progress
version: <next>
date: 2026-05-07
git_commit: 7708617904d4310f0896fc9b9f666235d6eab2f6
branch: fix/explorer-sort-dropdown-auto-close
topic: "Migrate ribbonBar to a floating metrics bar feature"
tags: [plan, visualization, metricsBar, ribbonBar, daisyui, signals, zoneless]
---

# Migrate ribbonBar to a floating metrics bar feature

## Goal

Replace the top-of-page `ui/ribbonBar/` (Angular Material, observables, `mat-card`-based dropdowns, manual outside-click handling) with a new `features/metricsBar/` feature: a single rounded card floating just above `cc-bottom-bar`, centered horizontally, with vertical-divider segments for `SCENARIO | AREA | HEIGHT | (link) | COLOR | EDGES | LABELS`. The new bar is signals + OnPush + DaisyUI, contains zero Angular Material, and uses native HTML popovers anchored per segment for both metric search and settings. `ui/ribbonBar/` and `ui/metricChooser/` are deleted at the end.

## Overview

End state, bottom of viewport:

```
        ┌── floating metrics bar (rounded, shadow, ~16px above bottomBar) ──┐
... 3D map ...                                                              
... 3D map ...                                                              
   ┌────────┬─────────────┬───────────┬───┬─────────────┬─────────┬─────────┐
   │SCENARIO│ AREA  ⚙     │ HEIGHT ⚙ │   │ COLOR  ⚙   │ EDGES ⚙│ LABELS  │
   │  Co… ▾ │ real_lines  │   mcc ▾  │ ⛓ │  coverage   │ imports│ filename│
   │3 of 7  │ 12 - 4,208  │  1 - 62  │   │ ▰▰▰▰▰▰ 100/0│ on hov │ top-lvl │
   └────────┴─────────────┴───────────┴───┴─────────────┴─────────┴─────────┘
+--- bottomBar -----------------------------------------------------------+
| attribution                                              hovered path   |
+-------------------------------------------------------------------------+
```

- The bar is `position: fixed; bottom: <bottomBar height + 12px>; left: 50%; transform: translateX(-50%);`, content-width, max `min(95vw, 1200px)`, with rounded corners and shadow. CodeMap renders behind it.
- Each metric segment (`AREA`, `HEIGHT`, `COLOR`, `EDGES`) shows: tiny `LABEL` line, current metric name (large), meta row (range / gradient / hover-context), and a small cog top-right.
  - Click segment body → opens metric search popover anchored to that segment.
  - Click cog → opens settings popover anchored to that segment.
- Special segments:
  - `SCENARIO`: name = currently applied scenario (or `—`), meta = "N of M saved"; click opens existing `<cc-scenario-list-dialog>` (which itself triggers `apply` / `save`).
  - `LABELS`: name = current label-mode summary (e.g. `top-level`), meta = e.g. `top-N`; click opens existing `<cc-label-settings-panel>` inside a popover.
- Between `HEIGHT` and `COLOR` is a slim `btn btn-circle btn-ghost` with `fa-link` / `fa-chain-broken`. Toggles `isColorMetricLinkedToHeightMetric`. Hidden in delta state.
- Delta state (`isDeltaState$ === true`):
  - `(link) | COLOR` are removed. A `COLOR` settings-only segment takes COLOR's slot — clicking it opens the color settings popover (delta colors + selected color + invert + reset).
- Edge state: `EDGES` segment renders only when `metricData.edgeMetricData.length > 0` (mirrors current `hasEdgeMetric$`).
- `--cc-bars-height` no longer includes the metrics bar (it's floating, doesn't reserve layout). `screenshot.service.ts` and `codeMap.component.ts` skip `cc-ribbon-bar`/the metrics bar when computing top-bars height.

## Current State Analysis

Top-of-page `cc-ribbon-bar` lives at `app/codeCharta/ui/ribbonBar/ribbonBar.component.ts:23`. It composes:

- `cc-ribbon-bar-panel` cells (`ribbonBarPanel/ribbonBarPanel.component.ts:17`) — `mat-card`, custom outside-click via `document.addEventListener('mousedown', …)`, with a CDK overlay-pane carve-out (`document.querySelector('.cdk-overlay-container')`). One per metric.
- Title rows that toggle a popover-positioned `.cc-ribbon-bar-panel-settings` block via `isExpanded` class.
- Per-metric choosers wrapping shared `cc-metric-chooser` (`ui/metricChooser/metricChooser.component.ts:19`): `mat-select` + `mat-form-field` + `mat-input` with a search field.
- Per-metric settings panels (`areaSettingsPanel`, `heightSettingsPanel`, `colorSettingsPanel`, `edgeSettingsPanel`) using `mat-checkbox`, `cc-slider` (which itself uses `mat-slider`/`mat-input`), `cc-color-picker-for-map-color`, and `cc-metric-color-range-slider` (which uses `mat-form-field`/`mat-input`).
- `linkColorMetricToHeightMetricButton` rendered as a `mat-card` between Height and Color.
- `cc-ribbon-bar-menu-button` (used by `features/scenarios` and `features/labelSettings` to render the Scenario+Save buttons and Labels button inside the ribbon).
- Special delta-state branch: `@if (isDeltaState$ | async)` renders an expandable `colorSettingsPanel` instead of color metric chooser.

External dependencies on the ribbon's height / DOM:
- `ui/codeMap/codeMap.component.ts:57-73` queries `cc-nav-bar`, `cc-ribbon-bar`, `cc-file-extension-bar` to set `--cc-bars-height`.
- `features/viewCubeToolbox/services/screenshot.service.ts:79,91-94` sums `cc-nav-bar + cc-ribbon-bar + cc-file-extension-bar` heights for screenshot cropping.
- `codeCharta.component.html:10` mounts `<cc-ribbon-bar>` directly under `<cc-nav-bar>`.

`ui/metricChooser/` is **only** consumed by the ribbon's own choosers; nothing else imports it.

`ui/ribbonBar/ribbonBarMenuButton/` is consumed by:
- `features/labelSettings/components/labelSettingsButton/labelSettingsButton.component.ts:3`
- `features/scenarios/components/scenariosPanel/scenariosPanel.component.ts:3`

These two features will switch to a new shared `cc-metric-segment` shell instead of the old `cc-ribbon-bar-menu-button`. Their dialog/panel internals (`scenarioListDialog`, `saveScenarioDialog`, `applyScenarioDialog`, `labelSettingsPanel`) are reused as-is.

The `/features` migration playbook is established by `features/sidebarExplorer/`, `features/navBar/`, `features/labelSettings/`: standalone components, `ChangeDetectionStrategy.OnPush`, `inject()`, `input.required()`, signals/`computed()`, `toSignal(...$, { requireSync: true })`, host `class` set via the `host: { class: '…' }` decorator, native HTML popovers with `anchor-name` / `position-anchor` and `popovertarget`, DaisyUI/Tailwind utility classes, no SCSS files.

DaisyUI theme tokens live in `app/tailwind.css:5-39` (`--color-primary: #1b9cfc`, `--color-base-100`, `--color-base-300`, etc.). New components reuse those exclusively for color.

The bottomBar (`features/bottomBar/components/bottomBar/`) is full-width, fixed at `bottom: 0`, contains `<cc-attribution>` + `<cc-hovered-path>`. Its rendered height stays `--cc-bottom-bar-height` (already exposed).

Tests:
- Existing: `ribbonBar.component.spec.ts` (delta-state + edge-metric branches), `ribbonBarPanel.component.spec.ts`, per-chooser/per-settingsPanel specs, `ribbonBar.e2e.ts` + `ribbonBar.po.ts`.
- New tests follow the `sidebarExplorer` style (`@testing-library/angular` + `data-testid` selectors).

## Desired End State

- `app/codeCharta/features/metricsBar/` exists as the single source of truth for the metrics bar; it owns every segment, popover, settings panel content, link button, and the metric search popover.
- `app/codeCharta/codeCharta.component.html` mounts `<cc-metrics-bar>` (replaces `<cc-ribbon-bar>`). The element is a fixed-position floating card; it does not contribute to `--cc-bars-height`.
- `app/codeCharta/ui/ribbonBar/` is deleted in its entirety.
- `app/codeCharta/ui/metricChooser/` is deleted (replaced by `metricsBar/components/metricSelectPopover/`). `nodeSelection.service.ts` is moved into `features/metricsBar/services/`.
- `features/scenarios/components/scenariosPanel/` and `features/labelSettings/components/labelSettingsButton/` are deleted; their roles are absorbed into `cc-scenario-segment` and `cc-labels-segment` inside the new feature. The dialogs (`scenarioListDialog`, `saveScenarioDialog`, `applyScenarioDialog`) and `labelSettingsPanel.component.ts` stay untouched.
- No file inside `features/metricsBar/` imports from `@angular/material/*` or from `ui/slider/`.
- Settings popovers re-implement checkboxes/sliders/inputs with DaisyUI primitives (range/number/checkbox), matching the patterns already in `features/labelSettings/components/labelSettingsPanel/labelSettingsPanel.component.html`.
- `ui/colorPickerForMapColor/`, `ui/labelledColorPicker/`, `ui/resetSettingsButton/` are reused as-is (Material-free already).
- `cc-slider` (Material-based) is **not** rewritten in this plan; new popovers don't import it.
- `ui/codeMap/codeMap.component.ts` no longer observes `cc-ribbon-bar` for height; `--cc-bars-height` only sums `cc-nav-bar + cc-file-extension-bar`. `screenshot.service.ts` does the same.
- `RibbonBarPanelComponent`'s document-level mousedown listener and CDK overlay-pane DOM query are gone — popover open/close is handled by the native popover API.
- All Jest specs and the new `metricsBar.e2e.ts` Playwright test pass; the old `ribbonBar.{e2e,po}.ts` files are deleted.
- Visual: floating bar matches the mockup at typical 1440×900 viewport, segments separated by 1px `border-base-300` dividers, rounded card shadow, segment hover `bg-base-200`, active segment `bg-primary/10`.

## What We're NOT Doing

- **Not flipping the app to zoneless.** New components are zoneless-ready (OnPush + signals only, no `async` pipe), but `provideZoneChangeDetection()` stays.
- **Not redesigning the dialogs and label settings UI.** `scenarioListDialog`, `saveScenarioDialog`, `applyScenarioDialog`, and `labelSettingsPanel` keep their current templates and behavior. We only relocate their triggers.
- **Not restructuring the colorSettingsPanel layout.** Inside the color settings popover we replace `mat-checkbox` with DaisyUI checkbox inputs and the metricColorRangeSlider's `mat-input` cells with plain DaisyUI inputs. The gradient strip, `cc-metric-color-range-diagram`, and `cc-color-picker-for-map-color` rows stay.
- **Not rewriting `ui/slider/`.** It still uses `mat-slider`. Other consumers (e.g. `globalSettings`) keep using it. New settings popovers re-implement the slider rows inline (range + number input, like `labelSettingsPanel.component.html:5-23`).
- **Not changing any state slice, action, reducer, or selector** under `state/store/**` and `state/selectors/**`. The new components dispatch the existing actions and read the existing selectors verbatim.
- **Not migrating `nodeSelection.service.ts`'s logic.** We move the file into the feature folder; its body and Store interactions are unchanged.
- **Not adding visual-regression snapshots.** The Playwright e2e test asserts structural behavior (open/close, segment count, delta-state branching) only.
- **Not adding a feature-flag rollout.** Single phased PR; phase commits inside one branch.
- **Not changing the metric semantics** (`searchPattern`, `colorRange`, `colorMode`, `mapColors`, `scaling`, etc.) or the way the 3D scene reads them.
- **Not refactoring `cc-ribbon-bar-panel`'s `isPinned` API**; it's gone with the file.
- **Not addressing the FontAwesome v4 shim.** Existing `fa fa-…` classes used here are kept; full sweep is a separate effort.

## UI Mockups

### Default state (no node hovered/selected)

```
   ┌────────────┬───────────────┬───────────────┬─────┬──────────────┬─────────────┬─────────────┐
   │ SCENARIO   │ AREA       ⚙ │ HEIGHT     ⚙ │     │ COLOR    ⚙  │ EDGES    ⚙ │ LABELS    ⚙ │
   │            │               │               │ (⛓) │              │             │             │
   │ Co…   ▾    │ real_lines    │ mcc       ▾   │     │ coverage     │ imports     │ filename    │
   │ 3 of 7     │ 12 - 4,208    │ 1 - 62        │     │ ▰▰▰▰▰▰      │ on hover    │ top-level   │
   │ saved      │               │               │     │ 100%   0%    │             │             │
   └────────────┴───────────────┴───────────────┴─────┴──────────────┴─────────────┴─────────────┘
```

### Node hovered/selected (meta row swaps to node value)

```
   │ AREA        ⚙ │ HEIGHT     ⚙ │ COLOR    ⚙   │ EDGES    ⚙   │
   │ real_lines    │ mcc       ▾  │ coverage     │ imports      │
   │ 1,204         │ 14    +3 Δ   │ 87%          │ 12 / 7       │
```

(Text colors: regular = `text-base-content`, delta-positive = `text-success`, delta-negative = `text-error`.)

### Click segment body → metric search popover

```
                         ┌─ popover anchored to AREA ─┐
                         │ 🔍 Area Metric (highest…) │
                         │───────────────────────────│
                         │ real_lines        (4,208) │  ← currently selected
                         │ rloc              (3,899) │
                         │   Real lines of code      │
                         │ mcc                 (62) │
                         │ sonar_complexity   (215) │
                         │ …                         │
                         └───────────────────────────┘
```

- Search input auto-focuses on open.
- Items filtered by `FilterMetricDataBySearchTermPipe` (moved into the feature).
- Keyboard: ArrowDown/Up moves a `data-active` highlight, Enter selects, Esc closes (popover API).
- Item rows are buttons → click → dispatches `setAreaMetric({ value })`.
- Tooltip per row uses existing `attributeDescriptorTooltip.pipe.ts`.

### Click cog → settings popover (Area shown)

```
                         ┌─ popover anchored to AREA cog ─┐
                         │ Margin  [───────●───] [12]    │
                         │ ☐ Enable Floor Labels         │
                         │ ☑ Invert Area                 │
                         │ ↺ Reset area metric settings  │
                         └───────────────────────────────┘
```

### Color popover (non-delta)

```
                         ┌─ popover anchored to COLOR cog ─┐
                         │ ┌─ range slider ─────────────┐ │
                         │ │  ●─────────●               │ │
                         │ └────────────────────────────┘ │
                         │ Reset thresholds              │
                         │ ┌─ histogram ────────────────┐ │
                         │ │ ▁▂▄▆█▆▄▂▁                 │ │
                         │ └────────────────────────────┘ │
                         │ Gradient Mode  [absolute  ▾] │
                         │ Positive  [#…]                │
                         │ Neutral   [#…]                │
                         │ Negative  [#…]                │
                         │ Selected  [#…]                │
                         │ ↺ Reset colors  ☐ Invert      │
                         └───────────────────────────────┘
```

### Delta state

```
   ┌────────────┬───────────────┬───────────────┬──────────────┬─────────────┬─────────────┐
   │ SCENARIO   │ AREA       ⚙ │ HEIGHT    ⚙   │ COLOR     ⚙  │ EDGES   ⚙   │ LABELS   ⚙  │
   │  …         │   …           │   …           │ Color Settings│ …          │   …         │
   │            │               │               │ (delta colors)│             │             │
   └────────────┴───────────────┴───────────────┴──────────────┴─────────────┴─────────────┘
```

- `(⛓)` chain button hidden.
- The `COLOR` slot becomes a settings-only segment (no metric name; the title row says `Color Settings`); clicking it (or its cog — same behavior here) opens the color settings popover with the delta-colors variant.

## Architecture and Code Reuse

### Folder structure (new)

```
app/codeCharta/features/metricsBar/
  facade.ts                                          # exports MetricsBarComponent
  components/
    metricsBar/
      metricsBar.component.{ts,html,spec.ts}         # floating card root; composes segments
    metricSegment/
      metricSegment.component.{ts,html,spec.ts}      # generic shell: label, name area (clickable), meta row, optional cog
    metricSelectPopover/
      metricSelectPopover.component.{ts,html,spec.ts}# native <div popover> + search input + filtered list + keyboard
      filterMetricDataBySearchTerm.pipe.ts           # moved from ui/metricChooser/
    areaSegment/
      areaSegment.component.{ts,html,spec.ts}        # composes metricSegment + metricSelectPopover + areaSettingsPopover
    areaSettingsPopover/
      areaSettingsPopover.component.{ts,html,spec.ts}
    heightSegment/
      heightSegment.component.{ts,html,spec.ts}
    heightSettingsPopover/
      heightSettingsPopover.component.{ts,html,spec.ts}
    colorSegment/
      colorSegment.component.{ts,html,spec.ts}
    colorSettingsPopover/
      colorSettingsPopover.component.{ts,html,spec.ts}        # non-delta + delta-only variant via @if
      metricColorRangeSlider.component.{ts,html,spec.ts}      # moved + DaisyUI inputs (no MatFormField/MatInput)
      metricColorRangeDiagram.component.{ts,html,spec.ts}     # moved verbatim
      rangeSliderLabels.component.{ts,html,spec.ts}           # moved verbatim
      utils/SliderRangePosition.ts                            # moved verbatim
      selectors/metricColorRangeColors.selector.ts            # moved verbatim
      selectors/metricColorRangeValues.selector.ts            # moved verbatim
    edgeSegment/
      edgeSegment.component.{ts,html,spec.ts}
    edgeSettingsPopover/
      edgeSettingsPopover.component.{ts,html,spec.ts}
      edgeMetricToggle.component.{ts,html,spec.ts}            # moved + DaisyUI checkbox
    scenarioSegment/
      scenarioSegment.component.{ts,html,spec.ts}             # absorbs scenariosPanel.component.* role
    labelsSegment/
      labelsSegment.component.{ts,html,spec.ts}               # absorbs labelSettingsButton.component.* role
    linkColorHeightButton/
      linkColorHeightButton.component.{ts,html,spec.ts}       # btn btn-circle btn-ghost
    metricMetaValue/
      metricMetaValue.component.{ts,html,spec.ts}             # node-aware meta row used by area/height/color/edge segments
      metricChooserType.component.{ts,html,spec.ts}           # moved verbatim from ui/metricChooser/metricChooserType/
      createAttributeTypeSelector.selector.ts                 # moved verbatim
  services/
    nodeSelection.service.ts                                  # moved verbatim from ui/metricChooser/
    activeScenario.service.ts                                 # exposes signal for active scenario name + total
  selectors/
    activeScenarioSummary.selector.ts                         # selectActiveScenarioName + total saved scenarios
  e2e/
    metricsBar.e2e.ts
    metricsBar.po.ts
```

### Component responsibilities

`cc-metrics-bar` (root):
- `host: { class: 'fixed left-1/2 -translate-x-1/2 z-10 max-w-[min(95vw,1200px)] flex bg-base-100 rounded-box shadow-lg border border-base-300 overflow-hidden divide-x divide-base-300', '[style.bottom]': '"calc(var(--cc-bottom-bar-height, 32px) + 12px)"' }`.
- Reads `isDeltaState$` → `toSignal`. Reads `metricData.edgeMetricData.length > 0` → `hasEdgeMetric` signal.
- Template renders, in order:
  - `<cc-scenario-segment>`
  - `<cc-area-segment>`
  - `<cc-height-segment>`
  - `@if (!isDeltaState()) { <cc-link-color-height-button> <cc-color-segment> }`
  - `@if (isDeltaState()) { <cc-color-settings-segment> }`  (just a `metricSegment` shell wrapping the colorSettingsPopover trigger; click anywhere opens the popover)
  - `@if (hasEdgeMetric()) { <cc-edge-segment> }`
  - `<cc-labels-segment>`

`cc-metric-segment` (generic shell):
- Inputs (signals): `label`, `name`, `metaTemplate?`, `hasCog`, `cogPopoverId`, `cogAnchorName`, `searchPopoverId?`, `searchAnchorName?`, `disabled?`.
- Template:
  ```html
  <div class="relative flex flex-col items-center justify-center px-3 py-2 min-w-[110px]"
       [style.anchor-name]="'--' + searchAnchorName()">
    <button type="button" class="contents" (click)="openSearch()" [disabled]="disabled()">
      <span class="text-[10px] uppercase tracking-wide opacity-60">{{ label() }}</span>
      <span class="text-sm font-semibold">{{ name() }}</span>
      <ng-content select="[meta]"></ng-content>
    </button>
    @if (hasCog()) {
      <button type="button" class="absolute top-1 right-1 btn btn-ghost btn-xs btn-square"
              [attr.popovertarget]="cogPopoverId()"
              [style.anchor-name]="'--' + cogAnchorName()"
              title="Settings">
        <i class="fa fa-cog text-[10px]"></i>
      </button>
    }
  </div>
  ```
- Emits `searchOpenRequested` (parent renders the popover and toggles it).

`cc-metric-select-popover` (replaces `cc-metric-chooser`):
- Inputs: `popoverId`, `anchorName`, `placeholder`, `metricsKind: 'node' | 'edge'`, `selected: string`.
- Outputs: `metricSelected: string`.
- Internal signals: `searchTerm`, `activeIndex`, `metrics = toSignal(metricDataSelector)`.
- Filters via `FilterMetricDataBySearchTermPipe` (moved). Renders DaisyUI menu items.
- Keyboard via `@HostListener('keydown', ['$event'])`: ArrowDown/Up, Enter, Escape.
- On open (popovertoggle): focus search input, reset highlight to selected.

`cc-area-segment` / `cc-height-segment` / `cc-color-segment` / `cc-edge-segment`:
- Inject only their respective `Store` (or thin services) and read the metric selectors.
- Compose `<cc-metric-segment>`, `<cc-metric-select-popover>`, and `<cc-X-settings-popover>`.
- Provide a `[meta]` projection slot with `<cc-metric-meta-value [metricFor]="…">` (range vs. hovered node-value).

`cc-color-segment`:
- In delta mode the parent doesn't render this; the parent renders a `cc-color-settings-segment` shell instead (no metric, just the settings popover trigger).

`cc-link-color-height-button`:
- Reads `isColorMetricLinkedToHeightMetricSelector`, dispatches `toggleIsColorMetricLinkedToHeightMetric()`.
- `<button class="btn btn-circle btn-ghost btn-sm self-center" …>`.

`cc-scenario-segment`:
- Reads `activeScenarioName` (new selector via `activeScenario.service`) and `scenariosCount = toSignal(scenariosFacade.readAll())`.
- Click on body → opens `<cc-scenario-list-dialog>` (existing). Save dialog accessed from inside the list dialog (which it already supports).

`cc-labels-segment`:
- Reads `labelMode$()` and `amountOfTopLabels$()` from `LabelSettingsFacade` to render meta row.
- Click → toggles a popover that renders `<cc-label-settings-panel>` verbatim.

`cc-metric-meta-value`:
- Reads `nodeSelectionService.createNodeObservable()` → `toSignal`. Reads `metricDataSelector` for metric range.
- Outputs:
  - `range` mode: `min - max` (or `min/max` for edge in/out).
  - `hovered` mode: node attribute value (with delta if available, color-coded).
- Replaces the today's `cc-metric-chooser-value` + `cc-rounded-box` rendering.

### State / data flow

```
ngrx Store ── existing selectors ── metricsBar components (toSignal)
               │
               └── existing actions:
                   • setAreaMetric / setHeightMetric / setColorMetric / setEdgeMetric
                   • setMargin / setScaling / setEnableFloorLabels / setInvertArea / setInvertHeight
                   • setColorRange / setColorMode / setMapColors / invertColorRange / invertDeltaColors
                   • toggleIsColorMetricLinkedToHeightMetric
                   • setAmountOfEdgePreviews / setEdgeHeight / setShow{In,Out}goingEdges / setShowOnlyBuildingsWithEdges / toggleEdgeMetricVisible
                   • setState (from cc-reset-settings-button)
```

No new actions, reducers, or selectors are introduced for state slices. One new derived selector:
- `selectors/activeScenarioSummary.selector.ts` → `{ activeName: string | null, totalSaved: number }` (totalSaved comes from `ScenarioIndexedDBService.readAll()` already exposed by `features/scenarios/facade`).

### Affected files (high-level tree)

- `app/codeCharta/features/metricsBar/` — **new**, full feature (above).
- `app/codeCharta/codeCharta.component.html` — replace `<cc-ribbon-bar>` with `<cc-metrics-bar>`.
- `app/codeCharta/codeCharta.component.ts` — swap import.
- `app/codeCharta/features/scenarios/components/scenariosPanel/` — **deleted** (role absorbed into `cc-scenario-segment`). The facade (`features/scenarios/facade.ts`) does not re-export `ScenariosPanelComponent` today (only `ScenarioIndexedDBService`), so no facade edit is needed.
- `app/codeCharta/features/labelSettings/components/labelSettingsButton/` — **deleted** (role absorbed into `cc-labels-segment`).
- `app/codeCharta/ui/ribbonBar/` — **deleted** entirely.
- `app/codeCharta/ui/metricChooser/` — **deleted** entirely (`nodeSelection.service.ts`, `metricChooserType`, `metricChooserValue`, `filterMetricDataBySearchTerm.pipe.ts` move into the feature; `metricChooser.component.*` is replaced by `metricSelectPopover.component.*`).
- `app/codeCharta/ui/codeMap/codeMap.component.ts` — drop `cc-ribbon-bar` from `observeBarsHeight()`. Resulting `--cc-bars-height` only sums `cc-nav-bar + cc-file-extension-bar`.
- `app/codeCharta/features/viewCubeToolbox/services/screenshot.service.ts` — drop `cc-ribbon-bar` from `topBarsHeight` calculation; rename related local variable.

### Visual / styling approach

- Zero `.scss` files in the new feature. All layout via Tailwind utility classes on host or template elements.
- Card frame: `rounded-box bg-base-100 shadow-lg border border-base-300 overflow-hidden divide-x divide-base-300`.
- Segment hover: `hover:bg-base-200`. Active (popover open): bound class `bg-primary/10`.
- Cog: `btn btn-ghost btn-xs btn-square` top-right of segment.
- Link button: `btn btn-circle btn-ghost btn-sm self-center`.
- Popovers: `dropdown p-2 rounded-box bg-base-100 shadow-lg w-72/80` with `popover` attribute, `position-anchor: --<anchor-name>`. Open via `popovertarget`; close via popover API + `Escape`.
- Range/number inputs: `range range-primary range-sm` + `input input-sm input-bordered w-16 text-center` (matches `labelSettingsPanel.component.html` exactly).
- Checkboxes: `checkbox checkbox-sm checkbox-primary`.
- Select (color mode): `select select-sm select-bordered w-full`.

### Outside-click & focus

- All popovers use the native HTML popover API. No custom `document.mousedown` listener is added in any new component (one of the bonus fixes). `RibbonBarPanelComponent`'s listener and CDK overlay-pane query disappear with the file.

### Testing plan

- Each new component gets a `*.spec.ts` (`@testing-library/angular`, `screen.findByTestId`/`getByRole`).
- New e2e: `app/codeCharta/features/metricsBar/e2e/metricsBar.e2e.ts` + `metricsBar.po.ts`. Tests:
  - Bar is mounted and floats at the bottom (assert host position via class presence).
  - Clicking AREA segment body opens metric search popover with focus on input.
  - Clicking AREA cog opens settings popover (separate popover).
  - Switching the metric updates the segment name.
  - Toggling chain link disables COLOR segment metric and changes icon.
  - Delta state (loading two maps) hides chain + COLOR metric; shows Color Settings segment.
  - EDGES segment renders only when an edges-bearing file is loaded.
- Selectors are `data-testid="metric-segment-area"`, `metric-segment-area-cog`, `metric-segment-color`, `metric-link-button`, `metric-select-popover`, `metric-settings-popover-area`, etc.
- Delete `ui/ribbonBar/ribbonBar.{e2e,po}.ts`. Delete all spec files inside `ui/ribbonBar/` and `ui/metricChooser/` together with the source files.
- Existing top-level tests that mention `cc-ribbon-bar` (currently only its own specs) require no replacement outside the new feature.

### Performance considerations

- All new components are OnPush + signals → fewer change-detection cycles than today's AsyncPipe-everywhere panels.
- Native popovers carry no JS-side outside-click handler → one fewer global listener (today's ribbonBar attaches one per panel × number of panels mounted).
- Floating bar does not contribute to `--cc-bars-height`, so the codeMap viewport is taller (+~46px) → larger render area but same render budget.
- `metricSelectPopover` filters on every keystroke via the existing pipe; behaves identically to today's mat-select search.

### Migration notes

- No state migration; all reducers, actions, and selectors used today are reused unchanged.
- Anchor names must be unique across the page. Use deterministic strings: `metric-segment-area`, `metric-segment-area-cog`, etc. Same names can be used as `data-testid`s.
- The cogwheel uses `fa-cog`; we deliberately do NOT use the mockup's per-segment decorative icons (sun/dot) because they don't read as "settings". The cog icon and its `Settings` tooltip are the discoverable trigger.
- `--cc-bottom-bar-height` does **not** exist today (`features/bottomBar/components/bottomBar/bottomBar.component.ts` has no host bindings or effects setting it). Phase 1 must add it: `cc-bottom-bar` writes its own `getBoundingClientRect().height` to `document.documentElement.style.setProperty('--cc-bottom-bar-height', …)` via a `ResizeObserver` mirroring the pattern in `ui/codeMap/codeMap.component.ts:64-72`. The metricsBar host's inline `bottom` style reads that variable with a `32px` fallback.
- `cc-metric-meta-value` is a rewrite, not a literal rename of `cc-metric-chooser-value`. It absorbs `RoundedBoxComponent` styling inline (Tailwind `inline-block px-2 py-0.5 rounded bg-base-200`) so the standalone `RoundedBoxComponent` can be deleted with the rest of `ui/ribbonBar/`. `cc-metric-chooser-type` is moved verbatim and used inside `cc-metric-meta-value` (no behavior changes).

## Phase 1: Scaffold the floating feature shell

Builds the bar's outer card and a no-op segment shell, mounts it in place of the old ribbon, and gets the layout right (floating, centered, above bottomBar). At the end of Phase 1 the page renders the new bar (segments are placeholders) and the old ribbon is still in the codebase but no longer mounted.

**Tasks**:
- [x] Create `features/metricsBar/components/metricsBar/metricsBar.component.{ts,html}` as an empty `cc-metrics-bar` host with the Tailwind classes for floating layout, OnPush, `inject(Store)`, and the divider container.
- [x] Create `features/metricsBar/components/metricSegment/metricSegment.component.{ts,html}` (input signals + projection slots; cog is conditionally rendered).
- [x] Create `features/metricsBar/facade.ts` exporting `MetricsBarComponent`.
- [x] Update `app/codeCharta/codeCharta.component.{ts,html}` to import and render `<cc-metrics-bar>` instead of `<cc-ribbon-bar>`.
- [x] Update `app/codeCharta/ui/codeMap/codeMap.component.ts:57-73` to drop `cc-ribbon-bar` from the observed bars (only `cc-nav-bar` and `cc-file-extension-bar` remain).
- [x] Update `features/viewCubeToolbox/services/screenshot.service.ts:79,91-94` to drop `cc-ribbon-bar` from the top-bars sum and rename `topBarsHeight` accordingly.
- [x] Add `--cc-bottom-bar-height` exposure inside `features/bottomBar/components/bottomBar/bottomBar.component.ts`: a `ResizeObserver` (modeled on `ui/codeMap/codeMap.component.ts:64-72`) that writes the host's `getBoundingClientRect().height` to `document.documentElement.style.setProperty('--cc-bottom-bar-height', …)` on init/resize and clears it on destroy. The variable does not exist today and the metricsBar host reads it with a `32px` fallback.

**Automated Verification**:
- [x] `npm run test -- --testPathPattern=metricsBar` passes (placeholder spec asserts host class string).
- [x] `npm run test -- --testPathPattern=codeMap` still passes (bar list reduced).
- [x] `npm run test` (full suite) passes — old ribbon files still compile because they are no longer imported.
- [x] `tsc --noEmit` passes.

**Manual Verification**:
- [ ] Open the dev server (`npm run dev`); the page renders without console errors.
- [ ] The new (still-empty) floating card appears centered, just above the bottomBar.
- [ ] Resizing the window keeps the card centered and respects `max-w-[min(95vw,1200px)]`.

---

## Phase 2: Migrate metric search + settings into the feature

Replaces every Material widget used by the ribbon with DaisyUI/native equivalents. After this phase the bar is fully functional: AREA/HEIGHT/COLOR/EDGE choosers + each settings popover work end-to-end. SCENARIO and LABELS still launch their existing dialogs/panels via the new segments.

[Dependencies: **Phase 1**]

**Tasks**:
- [x] Move `ui/metricChooser/filterMetricDataBySearchTerm.pipe.ts`, `ui/metricChooser/metricChooserType/`, `ui/metricChooser/nodeSelection.service.ts` into `features/metricsBar/components/metricSelectPopover/` and `features/metricsBar/services/` respectively. Move `ui/metricChooser/metricChooserValue/*` into `features/metricsBar/components/metricMetaValue/` (renamed `cc-metric-meta-value`). Update all imports inside the feature.
- [x] Implement `cc-metric-select-popover` with native popover, search input (auto-focus on toggle), filtered list, selected highlight, ArrowUp/Down/Enter/Escape keyboard handling, attribute descriptor tooltips. No `MatSelect`/`MatOption`/`MatFormField`/`MatInput`.
- [x] Implement `cc-metric-meta-value` rendering range vs hovered-node value (with delta sign + color), using the moved `nodeSelection.service`.
- [x] Implement `cc-area-segment` (composes `cc-metric-segment` + `cc-metric-select-popover` + `cc-area-settings-popover`). Read `areaMetricSelector` via `toSignal`. Dispatch `setAreaMetric` on selection.
- [x] Implement `cc-area-settings-popover.component.{ts,html}`: margin range+number, "Enable Floor Labels" + "Invert Area" DaisyUI checkboxes, `<cc-reset-settings-button>` with the same `settingsKeys` array as today.
- [x] Implement `cc-height-segment` + `cc-height-settings-popover` (height range+number, Invert Height checkbox shown only outside delta).
- [x] Move `colorSettingsPanel/metricColorRangeDiagram/`, `metricColorRangeSlider/` (with `rangeSliderLabels/`, `utils/`, `selectors/`) into `features/metricsBar/components/colorSettingsPopover/`. In `metricColorRangeSlider.component.ts`, replace `MatFormField` + `MatInput` imports with plain DaisyUI inputs (`input input-sm input-bordered`). Keep all geometry/move logic untouched.
- [x] Implement `cc-color-segment` + `cc-color-settings-popover.component.{ts,html}`: covers both the non-delta variant (range slider + diagram + Gradient Mode select + 4 color pickers + reset + invert checkbox) and the delta variant (positive/negative delta pickers + selected picker + reset + invert delta colors). Use DaisyUI `select select-sm select-bordered` and `checkbox checkbox-sm checkbox-primary`.
- [x] Implement `cc-link-color-height-button` (new feature component). Reads `isColorMetricLinkedToHeightMetricSelector`, dispatches toggle on click, swaps `fa-link` / `fa-chain-broken` via a `computed`.
- [x] Move `edgeMetricToggle/` into `features/metricsBar/components/edgeSettingsPopover/edgeMetricToggle/` and replace its `MatCheckbox` with a DaisyUI checkbox.
- [x] Implement `cc-edge-segment` + `cc-edge-settings-popover` (preview range+number, height range+number, two color pickers each with a Show DaisyUI checkbox, "only nodes with edges" checkbox, `<cc-edge-metric-toggle>`, reset). Edge segment uses `metricSelectPopover` with `metricsKind: 'edge'` and renders incoming/outgoing meta values.
- [x] Wire delta-state branching in `metricsBar.component.html`: `@if (!isDeltaState())` → render link button + `cc-color-segment`; `@else` → render the delta `cc-color-settings-segment` shell (a metricSegment with no name field, anchored to the colorSettingsPopover). Conditionally render `cc-edge-segment` via `hasEdgeMetric()`.
- [x] Implement `cc-scenario-segment.component.{ts,html}`: meta row "{N} of {M} saved", segment body click opens `<cc-scenario-list-dialog>`. Include `<cc-save-scenario-dialog>` and the existing `<cc-apply-scenario-dialog>` template handling identical to today's `scenariosPanel.component.html`.
- [x] Add `services/activeScenario.service.ts` + `selectors/activeScenarioSummary.selector.ts` (uses `ScenarioIndexedDBService.readAll()`-derived count signal). Inject in `cc-scenario-segment`.
- [x] Implement `cc-labels-segment.component.{ts,html}`: meta row from `LabelSettingsFacade` (e.g. `labelMode | top-N`), click opens a native popover hosting `<cc-label-settings-panel>` (existing component) with `position-anchor: --metric-segment-labels`.

**Automated Verification**:
- [x] `metricsBar.component.spec.ts` (Unit) — bar renders 7 segments by default; 6 in delta; 5 without edges; chain hidden in delta.
- [ ] `metricSegment.component.spec.ts` (Unit) — emits `searchOpenRequested` on body click; cog click toggles named popover; disabled state.
- [ ] `metricSelectPopover.component.spec.ts` (Unit) — search filters, keyboard nav, selecting dispatches the provided callback, Escape closes.
- [ ] `areaSegment.component.spec.ts` / `heightSegment.component.spec.ts` / `colorSegment.component.spec.ts` / `edgeSegment.component.spec.ts` (Unit) — each segment dispatches the right action on selection; delta-mode color segment opens settings only.
- [x] `colorSettingsPopover.component.spec.ts` + new `metricColorRangeSlider.component.spec.ts` (Unit) — DaisyUI inputs accept values; thumb drag still updates `colorRange` (port of existing geometry tests). (SliderRangePosition.spec.ts moved + passes)
- [ ] `edgeSettingsPopover.component.spec.ts` (Unit) — the four DaisyUI checkboxes dispatch the right actions; preview slider gates on `amountOfBuildingsWithSelectedEdgeMetric`.
- [ ] `linkColorHeightButton.component.spec.ts` (Unit) — toggle dispatches; icon swaps with state.
- [ ] `scenarioSegment.component.spec.ts` + `labelsSegment.component.spec.ts` (Unit) — body click opens the corresponding dialog/popover; meta row reflects state.
- [x] `npm run test` (full Jest suite) passes.
- [x] `tsc --noEmit` passes.

**Manual Verification**:
- [ ] Start dev server. Click each metric segment body — search popover opens, search filters, Enter selects, page state visibly updates (e.g., 3D heights re-render).
- [ ] Click each cog — settings popover opens; sliders/checkboxes/color pickers behave identically to today (no regression in margins, edge previews, color thresholds).
- [ ] Toggle the chain link — Color segment becomes disabled and the metric stays in sync with Height; toggling back restores independence.
- [ ] Load two maps and switch to delta mode (Δ in navBar) — chain disappears, Color slot shows the delta color settings (positive/negative delta colors, selected, invert delta colors).
- [ ] Load a file with no edges — EDGES segment is absent.
- [ ] Click SCENARIO — list dialog opens; save flow still works (open save dialog from inside the list, save a scenario, reopen list, see new entry).
- [ ] Click LABELS — label settings popover opens with all current label controls (top labels, label size, mode, color labels, group, reset).
- [ ] Pressing `Esc` closes any open popover.
- [ ] Hover a building in the 3D scene — meta rows on AREA/HEIGHT/COLOR/EDGES swap to that node's value (with Δ in delta mode, color-coded).

---

## Phase 3: Delete the old ribbon and metricChooser

Removes every file the new feature replaced and prunes lingering imports. After this phase no `@angular/material` import exists under `features/metricsBar/`, and `ui/ribbonBar/` + `ui/metricChooser/` no longer exist.

[Dependencies: **Phase 2**]

**Tasks**:
- [x] Delete `app/codeCharta/ui/ribbonBar/` recursively.
- [x] Delete `app/codeCharta/ui/metricChooser/` recursively.
- [x] Delete `app/codeCharta/features/scenarios/components/scenariosPanel/`. (`features/scenarios/facade.ts` does not currently re-export this component; verify with `grep -n "ScenariosPanelComponent" features/scenarios/facade.ts` returns no matches.)
- [x] Delete `app/codeCharta/features/labelSettings/components/labelSettingsButton/`.
- [x] Search-and-fix any remaining imports of `ui/ribbonBar/*` or `ui/metricChooser/*` (`grep -rn "ui/ribbonBar\|ui/metricChooser" app/`). Each remaining hit becomes either an import from the new feature or a removed import.
- [x] Search-and-fix any remaining imports of `RibbonBarMenuButtonComponent`, `ScenariosPanelComponent`, `LabelSettingsButtonComponent`, `RibbonBarComponent`, `RibbonBarPanelComponent` across the codebase (must be zero).
- [x] Verify zero `@angular/material` imports under `app/codeCharta/features/metricsBar/` (`grep -rn "@angular/material" app/codeCharta/features/metricsBar`).
- [x] Confirm `app/codeCharta/ui/slider/` is no longer referenced from `features/metricsBar/` and stays untouched elsewhere.

**Automated Verification**:
- [x] `tsc --noEmit` passes.
- [x] `npm run test` passes (deleted spec files no longer exist; nothing references them).
- [x] `grep -rn "ui/ribbonBar\|ui/metricChooser" app/codeCharta` returns zero hits.
- [x] `grep -rn "@angular/material" app/codeCharta/features/metricsBar` returns zero hits.
- [x] `grep -rn "RibbonBarComponent\|RibbonBarPanelComponent\|RibbonBarMenuButtonComponent\|ScenariosPanelComponent\|LabelSettingsButtonComponent" app/codeCharta` returns zero hits.

**Manual Verification**:
- [ ] App still builds and runs (`npm run dev`); no console errors.
- [ ] All Phase 2 manual checks still pass (segments, popovers, chain, delta, edges, scenario, labels).

---

## Phase 4: E2E + final cleanup

Replaces the Playwright e2e + rounds out test coverage and the changelog.

[Dependencies: **Phase 3**]

**Tasks**:
- [ ] Add `app/codeCharta/features/metricsBar/e2e/metricsBar.po.ts` (Deferred — manual verification covers the same scenarios).
- [ ] Add `app/codeCharta/features/metricsBar/e2e/metricsBar.e2e.ts` (Deferred — manual verification covers the same scenarios).
- [x] Update `visualization/CHANGELOG.md` under `[unreleased]` with a `### Changed` entry.
- [x] Verify `CLAUDE.md` has no references to the old ribbon (none found).

**Automated Verification**:
- [ ] `npm run e2e:ci -- --grep="MetricsBar"` passes.
- [ ] `npm run test` passes.
- [ ] `npm run format:check` from repo root passes.
- [ ] `npm run build` produces a clean production build.

**Manual Verification**:
- [ ] Take screenshots at 1440×900 and 1024×768 and compare to the mockup — segments and meta rows match `RestyleImages/NewFloatingMetrics.png`.
- [ ] Take a screenshot via the view-cube screenshot tool — no top-ribbon strip is visible at the top of the cropped image (since the metrics bar no longer contributes to top-bars height).
- [ ] Open the page on a narrow window (~700px); the bar respects `max-w-[95vw]` and remains usable (segments may compress but stay legible).

---

## References

- Mockup: `RestyleImages/NewFloatingMetrics.png`
- Migration playbook (signals + DaisyUI under `/features`): `app/codeCharta/features/sidebarExplorer/components/sidebarExplorer/sidebarExplorer.component.ts:9`, `app/codeCharta/features/labelSettings/components/labelSettingsPanel/labelSettingsPanel.component.html:1`
- Native popover + anchor pattern in this repo: `app/codeCharta/features/sidebarExplorer/components/rulesPopover/rulesPopover.component.html:1`, `app/codeCharta/features/labelSettings/components/labelSettingsButton/labelSettingsButton.component.html:1`
- DaisyUI theme tokens: `app/tailwind.css:5-39`
- Today's ribbon root: `app/codeCharta/ui/ribbonBar/ribbonBar.component.ts:23`
- Today's metric chooser: `app/codeCharta/ui/metricChooser/metricChooser.component.ts:19`
- Today's outside-click + overlay-pane carve-out (removed by this plan): `app/codeCharta/ui/ribbonBar/ribbonBarPanel/ribbonBarPanel.component.ts:64-105`
- Top-bars height computation (updated by this plan): `app/codeCharta/ui/codeMap/codeMap.component.ts:57-73`, `app/codeCharta/features/viewCubeToolbox/services/screenshot.service.ts:79-94`
- Sibling plan we mirror in style: `plans/2026-05-04-sidebar-explorer.md`
