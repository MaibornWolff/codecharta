---
name: redesign-color-settings-popover
issue: ""
state: complete
version: <next>
date: 2026-05-13
git_commit: 7708617904d4310f0896fc9b9f666235d6eab2f6
branch: fix/explorer-sort-dropdown-auto-close
topic: "Redesign the Color settings popover so it feels visually coherent like the Label settings panel"
tags: [plan, visualization, metricsBar, colorSettingsPopover, daisyui, restyle]
---

# Redesign the Color settings popover

> **Superseded** by `plans/color_metric_popover/2026-06-11-restyle-color-metric-popover.md` — the popover is being migrated to a new mockup-based layout. Phases 1–2 of this plan were implemented and remain in place until the new plan lands.

## Goal

The Color settings popover currently looks broken (`RestyleImages/BadMenu.png`): a 150 px-wide slider rail floats in a 640 px container leaving the number inputs orphaned at the edges, two full-width red-outline reset buttons dominate the visual hierarchy, and the color picker rows sit sparsely in a popover much wider than they need to be. The Label settings panel (`features/labelSettings/components/labelSettingsPanel/labelSettingsPanel.component.html`) is the visual reference — calm, scannable, no oversized destructive buttons. Bring the Color popover to that standard by re-arranging the existing sub-components and demoting the reset buttons. No sub-component refactors.

## Current State Analysis

- Template: `visualization/app/codeCharta/features/metricsBar/components/colorSettingsPopover/colorSettingsPopover.component.html`
- Component class: `visualization/app/codeCharta/features/metricsBar/components/colorSettingsPopover/colorSettingsPopover.component.ts` (uses signals + standalone imports for `MetricColorRangeSliderComponent`, `MetricColorRangeDiagramComponent`, `ColorPickerForMapColorComponent`, `ResetSettingsButtonComponent`).
- No `.scss` file for the popover. No `.spec.ts` and no Jest snapshots reference `colorSettingsPopover` (verified via `grep -rln "colorSettingsPopover\|ColorSettingsPopover" --include="*.spec.ts" --include="*.snap"`).
- Sub-components in scope **for re-use only** (cannot refactor):
  - `cc-metric-color-range-slider` (`metricColorRangeSlider.component.ts`): has `@Input() sliderWidth = 150`. The visual rail spans inside a `flex flex-1 mx-2` container — rail is fixed at `sliderWidth` px, container expands beyond it, leaving empty space (root cause of the orphaned-inputs issue).
  - `cc-metric-color-range-diagram` (`metricColorRangeDiagram.component.ts`): hardcoded SVG `width: 550, height: 250`. Host has `class: "flex justify-center"`. **This forces the popover width to ≈ 640 px whenever the diagram renders.**
  - `cc-color-picker-for-map-color` (`colorPickerForMapColor.component.html`): wraps `cc-labelled-color-picker`, which renders a 40 px-tall flex-row with swatch + rtl-direction label. Looks sparse stacked in a 640 px popover.
  - `cc-reset-settings-button`: `host: { class: "contents" }` was added in plan `2026-05-12-align-metric-settings-popover-style.md`. The inner `<button class="btn btn-outline btn-error gap-2">` becomes a direct flex child of whatever wraps it.
- Behavior signals/handlers to preserve verbatim: `colorMode`, `colorMetric`, `isDeltaState`, `sliderValues`, `sliderColors`, `isAttributeDirectionInversed`, `isColorRangeInverted`, `areDeltaColorsInverted`, `resetThresholdsKeys`, `handleValueChange`, `handleColorModeChange`, `handleIsColorRangeInvertedChange`, `handleAreDeltaColorsInvertedChange`, `resetInvertColorCheckboxes`, `resetColorRange`, `resetColorsKeys()`.
- Reference width values already used in the codebase: Area/Height popovers `w-72`, Edge popover `w-80`, metric-select popover `w-80`, Color popover `w-[640px] max-w-[95vw]`.
- Reference labels panel: host `flex flex-col gap-2.5 py-2 px-5`, single full-width `btn btn-outline btn-error gap-2` reset at the very bottom.

## Desired End State

- Popover width is **dynamic** based on whether the threshold/diagram section renders:
  - `w-[640px] max-w-[95vw]` when `!isDeltaState() && colorMetric() !== "unary"` (diagram visible).
  - `w-80` otherwise (delta mode or unary metric).
- The threshold slider rail visually aligns with the number inputs: `sliderWidth` is passed from this template (not the default 150) so the rail spans the actual container width.
- **Reset thresholds** sits inline on the same row as the slider + number inputs (right end of the row). It uses the standard `btn btn-outline btn-error gap-2` markup via the existing `cc-reset-settings-button`, content-sized — no full-width red bar.
- Color pickers stay stacked vertically (1-column, same as today) — user preference confirmed.
- Bottom action row is **Invert Colors on the left, Reset colors on the right** (swapped from the current Reset-left / Invert-right order). `Reset colors` stays content-sized in the `flex items-center justify-between` row.
- No section headers, no dividers, no new SCSS. Use only Tailwind utility classes and the existing labels-panel idioms.
- Delta-mode popover is narrow (`w-80`) and shows only: 2 delta color pickers, the `selected` picker, and the Invert/Reset row.
- All existing behavior preserved (no handler/selector/inputs renamed). No `.ts` changes other than a single `computed` signal for the width class.

## What We're NOT Doing

- Not modifying any sub-component (`cc-metric-color-range-slider`, `cc-metric-color-range-diagram`, `cc-color-picker-for-map-color`, `cc-labelled-color-picker`, `cc-reset-settings-button`). No changes to their `host` classes, hardcoded sizes, or templates.
- Not changing the d3 diagram's hardcoded 550 × 250 SVG dimensions. The 640 px popover width follows from this.
- Not consolidating the two reset buttons into one. They reset disjoint slices of state (`resetColorRange` vs. `setMapColors` defaults) and the plan explicitly keeps both.
- Not adding section headers, dividers, or any new SCSS file.
- Not touching the other metric popovers (Area, Height, Edge) or the metric-select popover.
- Not touching the Label settings panel — it remains the reference design.
- Not making the slider rail width truly responsive (no `ResizeObserver`). The fix is a static value tuned for the wide popover; if the user shrinks via `max-w-[95vw]` on a tiny viewport the rail will be too long, same as today.

## UI Mockups

### Non-delta, non-unary (wide, `w-[640px]`)

```
┌── popover w-[640px] gap-2.5 py-2 px-5 ─────────────────────────────┐
│                                                                    │
│ [34] [────●═══════●─────────] [67] [↺ Reset thresholds]            │ ← slider row + inline reset
│                                                                    │
│            ┌─── diagram (550 × 250, centered) ───┐                 │
│            │  metric                             │                 │
│            │  100 ┤    ░░░░░░░░░██████           │                 │
│            │   80 ┤    ░░░░░░░░░██████           │                 │
│            │   60 ┤    ░░░░░░░░░██████           │                 │
│            │    0 ┴────┴────┴────┴────           │                 │
│            │       0   40  80 100                │                 │
│            └─────────────────────────────────────┘                 │
│                                                                    │
│ Gradient Mode                                                      │
│ [ Weighted Gradient                                          ▾ ]   │
│                                                                    │
│ ▣ 1 to 33                                                          │
│ ▣ 34 to 66                                                         │ ← stacked vertically
│ ▣ 67 to 100                                                        │
│ ▣ selected                                                         │
│                                                                    │
│ ☐ Invert Colors                            [↺ Reset colors]        │ ← invert L, reset R
└────────────────────────────────────────────────────────────────────┘
```

### Delta mode (narrow, `w-80`)

```
┌── popover w-80 gap-2.5 py-2 px-5 ────────┐
│ ▣ positiveDelta                          │
│ ▣ negativeDelta                          │
│ ▣ selected                               │
│                                          │
│ ☐ Invert Colors      [↺ Reset colors]    │
└──────────────────────────────────────────┘
```

### Non-delta + unary metric (narrow, `w-80`)

```
┌── popover w-80 gap-2.5 py-2 px-5 ────────┐
│ ▣ positive                               │
│ ▣ neutral                                │
│ ▣ negative                               │
│ ▣ selected                               │
│                                          │
│ ☐ Invert Colors      [↺ Reset colors]    │
└──────────────────────────────────────────┘
```

## Architecture and Code Reuse

Two files touched. No new files, no new abstractions, no sub-component edits.

```
visualization/app/codeCharta/features/metricsBar/components/colorSettingsPopover/
├── colorSettingsPopover.component.html  ← MODIFY (template restructure)
└── colorSettingsPopover.component.ts    ← MODIFY (add 1 computed signal + 1 import)
```

Signals reused as-is (no new state, no removed state):

| Signal / handler | Source | Used by |
| --- | --- | --- |
| `isDeltaState()` | `toSignal(store.select(isDeltaStateSelector))` | `@if` branches + new `widthClass` computed |
| `colorMetric()` | `toSignal(store.select(colorMetricSelector))` | `@if (colorMetric() !== "unary")` + new `widthClass` |
| `sliderValues()` / `sliderColors()` / `isAttributeDirectionInversed()` | existing `toSignal` | bound to slider + diagram (unchanged) |
| `colorMode()` + `handleColorModeChange()` | existing | Gradient Mode select (unchanged) |
| `isColorRangeInverted()` / `areDeltaColorsInverted()` + handlers | existing | Invert Colors checkbox (unchanged) |
| `resetThresholdsKeys` / `resetColorRange` | existing | inline Reset thresholds button (relocated) |
| `resetColorsKeys()` / `resetInvertColorCheckboxes` | existing | bottom Reset colors button (relocated) |

New computed signal in `colorSettingsPopover.component.ts`:

```ts
readonly isWidePopover = computed(() => !this.isDeltaState() && this.colorMetric() !== "unary")
```

That's the only logic addition. The template references `isWidePopover()` once via the root element's class binding.

## Performance Considerations

None. Template-only re-arrangement plus a 1-line `computed` signal. No new subscriptions, no resize observers, no extra DOM nodes beyond the wrapping flex row for the inline reset button.

## Migration Notes

- No persisted state changes.
- No selector / action / URL surface changes.
- The reset buttons retain identical `[settingsKeys]` / `[callback]` / `tooltip` / `label` inputs — `cc-reset-settings-button.applyDefaultSettings()` behaves exactly as before.
- Width changes are purely visual; native popover positioning (`[style.position-anchor]`, `[style.position-area]`) is unaffected — the browser re-measures on `popover` open.

---

## Phase 1: Dynamic popover width + Reset thresholds inline with slider

Bring the wide-vs-narrow width into the template via a single computed signal, and place `Reset thresholds` on the same row as the slider so the slider rail can grow and align with the number inputs.

**Intermediate state warning**: at the end of Phase 1 the popover is partly restyled — the new dynamic width and inline `Reset thresholds` are in place, but the bottom row still reads `Reset colors` (left) → `Invert Colors` (right) and the color pickers still sit inside the old `flex flex-col gap-1` wrapper. This is compilable and safe to test locally but **should not be shipped to `main` without Phase 2**. The agent implementing this plan must complete Phase 2 in the same change.

**Tasks**:
- [x] In `colorSettingsPopover.component.ts`:
  - Add `computed` to the `@angular/core` import list.
  - Add `readonly isWidePopover = computed(() => !this.isDeltaState() && this.colorMetric() !== "unary")` next to the other readonly signals.
- [x] In `colorSettingsPopover.component.html`, change the root element's class to a binding so the width tracks `isWidePopover()`. **Remove the static `class=` attribute entirely** — Angular's `[class]="'string'"` replaces (does not merge with) a sibling static `class=` attribute, so every utility class must live inside the binding's string. The unrelated `popover` HTML attribute and the `[id]` / `[style.*]` bindings remain untouched (they are independent attributes/bindings, not class):
  ```html
  <div
      [class]="'dropdown rounded-box bg-base-100 shadow-lg max-w-[95vw] flex flex-col gap-2.5 py-2 px-5 ' + (isWidePopover() ? 'w-[640px]' : 'w-80')"
      popover
      [id]="popoverId()"
      [style.position-anchor]="'--' + anchorName()"
      [style.position-area]="'top span-right'"
  >
  ```
- [x] Replace the existing `@if (!isDeltaState() && colorMetric() !== "unary") { <div class="flex flex-col gap-2"> ... </div> }` block (the one containing slider + Reset thresholds button + diagram + Gradient Mode select) with a flat structure that:
  1. Uses a single outer flex column (no inner wrapping `<div class="flex flex-col gap-2">` — let the popover's own `flex flex-col gap-2.5` drive spacing). **Note**: this intentionally widens the inter-element gap from 8 px (`gap-2`) to 10 px (`gap-2.5`) between the slider row, the diagram, and the Gradient Mode select. Confirmed during manual verification.
  2. Wraps `<cc-metric-color-range-slider>` and the relocated `<cc-reset-settings-button label="Reset thresholds" ...>` in one `<div class="flex items-center gap-2">` row.
  3. Adds `class="block flex-1"` to `<cc-metric-color-range-slider>` so the host element becomes a block-level flex-grow child of the row (its template root `<div class="flex items-center gap-2">` then renders at 100 % of the host width). **This does NOT change the slider rail width** — the rail is rendered as fixed-width `[style.width.px]` spans driven entirely by the `sliderWidth` input. Stretching the host only prevents the slider's number inputs and the reset button from being pushed off to one side; rail alignment with the right number input must still be tuned via `[sliderWidth]`.
  4. Passes `[sliderWidth]="290"` so the rail visually meets the right number input. Math: popover inner = `640 − 40 (px-5)` = `600`. Slider row outer = `slider host width + 8 (gap-2) + ~140 (button content)` = `600`, so slider host = `452`. Slider host content = `452 − 64 (left input) − 8 (inner gap-2) − 16 (inner mx-2 on container) − 8 (inner gap-2) − 64 (right input)` = `292`. Round to `290` so the rail finishes ~2 px before the right input rather than past it. Tune to 270–300 during manual verification if the reset button's actual rendered width differs from ~140 px.
  5. Keeps `<cc-metric-color-range-diagram>` exactly as it is today (all inputs unchanged), as a direct child of the popover root.
  6. Keeps the Gradient Mode `<label class="form-control">…<select…>…</select></label>` exactly as today, as a direct child of the popover root.

  Concrete expected fragment:
  ```html
  @if (!isDeltaState() && colorMetric() !== "unary") {
      <div class="flex items-center gap-2">
          <cc-metric-color-range-slider
              class="block flex-1"
              [minValue]="sliderValues().min"
              [maxValue]="sliderValues().max"
              [currentLeftValue]="sliderValues().from"
              [currentRightValue]="sliderValues().to"
              [leftColor]="sliderColors().leftColor"
              [middleColor]="sliderColors().middleColor"
              [rightColor]="sliderColors().rightColor"
              [handleValueChange]="handleValueChange"
              [isAttributeDirectionInversed]="isAttributeDirectionInversed()"
              [sliderWidth]="290"
          ></cc-metric-color-range-slider>
          <cc-reset-settings-button
              [settingsKeys]="resetThresholdsKeys"
              [callback]="resetColorRange"
              tooltip="Reset slider thresholds to default"
              label="Reset thresholds"
          ></cc-reset-settings-button>
      </div>
      <cc-metric-color-range-diagram
          [minValue]="sliderValues().min"
          [maxValue]="sliderValues().max"
          [currentLeftValue]="sliderValues().from"
          [currentRightValue]="sliderValues().to"
          [leftColor]="sliderColors().leftColor"
          [middleColor]="sliderColors().middleColor"
          [rightColor]="sliderColors().rightColor"
          [colorMetric]="colorMetric()"
          [values]="sliderValues().values"
          [isAttributeDirectionInverted]="isAttributeDirectionInversed()"
      ></cc-metric-color-range-diagram>
      <label class="form-control">
          <div class="label py-1">
              <span class="label-text">Gradient Mode</span>
          </div>
          <select
              class="select select-sm select-bordered w-full"
              [value]="colorMode()"
              (change)="handleColorModeChange($any($event.target).value)"
          >
              <option value="absolute">Absolute</option>
              <option value="focusedGradient">Focused Gradient</option>
              <option value="weightedGradient">Weighted Gradient</option>
              <option value="trueGradient">True Gradient</option>
          </select>
      </label>
  }
  ```

  **Note on `[sliderWidth]="290"`**: the value rendered through to the slider sub-component governs **only the colored rail spans** (`metricColorRangeSlider.component.html:11-26`), not the `flex-1 mx-2` container that holds them — the container grows freely with the popover row. If the rail is visibly short or overshoots the right input by more than ~10 px during manual verification, tune the constant to 270–300. Do not introduce a `ResizeObserver` or attempt to derive the value at runtime.

**Automated Verification**:
- [x] `npm test` (from `visualization/`) passes. No spec targets this template; the change cannot break any existing unit/integration test (verified at plan time via `grep -rln "colorSettingsPopover\|ColorSettingsPopover" --include="*.spec.ts" --include="*.snap"`).
- [x] `npm run build` (from `visualization/`) succeeds with no Angular template errors. (Dev server `bun --watch` rebuild confirmed clean after each template edit.)
- [x] `npm run format:check` (from repo root) passes.

**Manual Verification** (in the dev server already running on port 4200; load a non-delta `.cc.json` file with a non-unary color metric, e.g. `sonar_complexity`):
- [ ] Open the Color cog popover. The slider rail is now contiguous between the two number inputs (no orphaned "1 … 100" labels in the middle of empty space). The right number input sits immediately after the rail's right edge, then the `Reset thresholds` button sits to its right.
- [ ] `Reset thresholds` looks like a normal DaisyUI error-outline button at its natural content width (not a full-width red bar). Hover gives the standard DaisyUI hover state.
- [ ] Drag the slider thumbs — the color range updates as before (no behavior regression).
- [ ] Click `Reset thresholds` after dragging — thresholds reset to their default and the slider visualisation re-aligns.
- [ ] Vertical rhythm between the slider row, the diagram, and the Gradient Mode select is 10 px (`gap-2.5` of the popover root), not 8 px. This is intentional — see Phase 1 task 1, sub-bullet 1.
- [ ] If the rail still misses the right input by more than ~10 px, tune `[sliderWidth]` to 270 / 300 / etc. and re-verify. Record the final value used.
- [ ] Switch the file to delta mode (or load two files in delta) — the entire slider + diagram + Gradient + Reset-thresholds block disappears, and the popover visibly narrows to `w-80`.
- [ ] Switch the color metric to a unary metric (e.g. `unary`) in non-delta mode — same: the range section is hidden, popover narrows to `w-80`.

---

## Phase 2: Color pickers stay vertical + Invert/Reset bottom-row swap

Dependencies: **Phase 1** (so the dynamic width and inline reset are already in place when verifying the bottom area).

The color picker rows already render vertically as a `flex flex-col gap-1` — keep that. The only changes in this phase are: (a) let the popover's own `gap-2.5` drive spacing instead of the nested `flex flex-col gap-1`, and (b) swap the order in the bottom row so Invert Colors sits left and Reset colors sits right.

**Tasks**:
- [x] Replace the non-delta color pickers block (currently `<div class="flex flex-col gap-1">` containing positive/neutral/negative pickers) with the three pickers rendered as direct children of the popover root, so they inherit the popover's `gap-2.5` rhythm:
  ```html
  @if (!isDeltaState()) {
      <cc-color-picker-for-map-color [mapColorFor]="'positive'"></cc-color-picker-for-map-color>
      <cc-color-picker-for-map-color [mapColorFor]="'neutral'"></cc-color-picker-for-map-color>
      <cc-color-picker-for-map-color [mapColorFor]="'negative'"></cc-color-picker-for-map-color>
  } @else {
      <cc-color-picker-for-map-color [mapColorFor]="'positiveDelta'"></cc-color-picker-for-map-color>
      <cc-color-picker-for-map-color [mapColorFor]="'negativeDelta'"></cc-color-picker-for-map-color>
  }
  <cc-color-picker-for-map-color [mapColorFor]="'selected'"></cc-color-picker-for-map-color>
  ```
- [x] Swap the order inside the bottom action row so Invert Colors comes first and Reset colors is at the right end (where destructive actions conventionally live). The `flex items-center justify-between gap-2` container stays — only the children swap:
  ```html
  <div class="flex items-center justify-between gap-2">
      @if (!isDeltaState()) {
          <label class="flex items-center gap-2 cursor-pointer">
              <input
                  type="checkbox"
                  class="checkbox checkbox-sm checkbox-primary"
                  [checked]="isColorRangeInverted()"
                  (change)="handleIsColorRangeInvertedChange($event)"
              />
              <span>Invert Colors</span>
          </label>
      } @else {
          <label class="flex items-center gap-2 cursor-pointer">
              <input
                  type="checkbox"
                  class="checkbox checkbox-sm checkbox-primary"
                  [checked]="areDeltaColorsInverted()"
                  (change)="handleAreDeltaColorsInvertedChange($event)"
              />
              <span>Invert Colors</span>
          </label>
      }
      <cc-reset-settings-button
          [settingsKeys]="resetColorsKeys()"
          tooltip="Reset color values to default"
          label="Reset colors"
          [callback]="resetInvertColorCheckboxes"
      ></cc-reset-settings-button>
  </div>
  ```

**Automated Verification**:
- [x] `npm test`, `npm run build`, `npm run format:check` all pass (final pass after both phases). (`Test Suites: 338 passed, 338 total; Tests: 6 todo, 1922 passed, 1928 total`.)

**Manual Verification** (dev server, both delta and non-delta files):
- [ ] In non-delta mode the three color pickers (positive / neutral / negative) plus `selected` are stacked vertically, with the same `gap-2.5` rhythm as the rest of the popover (consistent with the labels panel density).
- [ ] In delta mode only `positiveDelta`, `negativeDelta`, `selected` render, and the popover is visibly narrower (`w-80`).
- [ ] Bottom row: the Invert Colors checkbox sits at the left and the `Reset colors` red-outline button sits at the right. Click the checkbox — invert state toggles. Click `Reset colors` — colors reset and the Invert Colors checkbox is unchecked (`resetInvertColorCheckboxes` callback).
- [ ] Compare side-by-side with the Label settings popover (open both in the floating metrics bar). Spacing, button emphasis, and density should feel consistent — no single oversized red bar dominating the Color popover.
- [ ] No console errors when opening either variant of the popover on a 1440×900 viewport.

---

## Phase 3: Changelog entry

Dependencies: **Phase 1**, **Phase 2**.

**Tasks**:
- [x] Add a `Changed` bullet under `[unreleased]` in `visualization/CHANGELOG.md`, immediately after the existing "Metric settings popovers" line added by plan `2026-05-12-align-metric-settings-popover-style.md`:
  ```
  - **Color settings popover layout**: Re-laid out the Color settings popover so the threshold slider rail aligns with the number inputs, the `Reset thresholds` button sits inline at the end of the slider row, the popover narrows to `w-80` in delta or unary-metric mode, and the bottom row reads `Invert Colors` (left) → `Reset colors` (right).
  ```

**Automated Verification**:
- [x] `npm run format:check` (from repo root) passes.

---

## References

- Reference labels panel: `app/codeCharta/features/labelSettings/components/labelSettingsPanel/labelSettingsPanel.component.html` + host class at `labelSettingsPanel.component.ts:21` (`flex flex-col gap-2.5 py-2 px-5`).
- Earlier plan that introduced the labels-panel-style spacing and the `host: { class: "contents" }` on `cc-reset-settings-button`: `plans/2026-05-12-align-metric-settings-popover-style.md`.
- Sub-components consumed verbatim:
  - `app/codeCharta/features/metricsBar/components/colorSettingsPopover/metricColorRangeSlider.component.ts` — `@Input() sliderWidth = 150` at `:23`.
  - `app/codeCharta/features/metricsBar/components/colorSettingsPopover/metricColorRangeDiagram.component.ts` — hardcoded SVG `svgWidth = 550, svgHeight = 250` at `:85-86`, host `class: "flex justify-center"` at `:15`.
  - `app/codeCharta/ui/colorPickerForMapColor/colorPickerForMapColor.component.html` — wraps `cc-labelled-color-picker`.
  - `app/codeCharta/ui/labelledColorPicker/labelledColorPicker.component.scss` — 40 px row height + rtl label.
  - `app/codeCharta/ui/resetSettingsButton/resetSettingsButton.component.ts` — `host: { class: "contents" }` makes the inner btn a direct flex child of the parent template.
- Screenshot of the current (broken) state: `RestyleImages/BadMenu.png`.
