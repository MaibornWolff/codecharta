---
name: restyle-color-metric-popover
issue: ""
state: complete
version: 1
date: 2026-06-11
tags: [plan, visualization, metricsBar, colorSettingsPopover, markedPackages, restyle]
---

# Restyle the Color settings popover to the new mockup

Mockup: `plans/color_metric_popover/restyle_color_metric.png`
Supersedes: `plans/2026-05-13-redesign-color-settings-popover.md`

## Goal

Migrate the Color settings popover to the mockup's single-column layout: header with metric name, slider row, distribution chart, segmented gradient mode, bands list with node counts, a folder-overrides section (backed by markedPackages), and an invert/reset footer.

Decisions (clarified with user):

- **Styling**: structure only — adopt the mockup's layout/sections/controls but use existing DaisyUI/Tailwind theme tokens (no cream/mono theme).
- **Gradient modes**: keep all 4 `ColorMode` values as a segmented control (Absolute / Focused / Weighted / Relative). No behavior change.
- **Folder overrides**: reuse the markedPackages state (shared with sidebar). Swatch click recolors with arbitrary colors, × unmarks, "Pin a folder color…" opens a folder search that marks a new package.
- **Scope**: phased — restyle first, folder overrides second. The 2026-05-22 metrics-bar distributions plan stays separate.

## Tasks

### 1. Restyle existing controls into the mockup layout

- Fixed narrow popover width (~420px), single column; drop the `w-[640px]`/`w-80` dynamic width logic
- Header row: swatch dot + "Color by <metric>" + reset-thresholds icon button (right) — replaces the inline "Reset thresholds" button
- Slider row: min input — slider rail with value labels above — max input
- DISTRIBUTION section: section label, "<metric> × quantile %" caption, quantile diagram resized to fit the column (replace hardcoded 550×250 SVG size)
- GRADIENT MODE: segmented control (DaisyUI join) for all 4 modes
- BANDS section: one row per band — swatch + value range + node count; swatch opens the existing color picker (replaces the labelled picker rows); keep the "selected" row
- Footer: Invert colors toggle (left) + Reset colors button (right)
- Delta mode / unary metric: keep the simplified narrow variant (delta pickers + selected + footer), as today

### 2. Folder overrides section (markedPackages)

- Selector providing marked packages with descendant file counts
- Section: "FOLDER OVERRIDES" label + "<n> pinned" + helper text ("These folders use a fixed color instead of the metric. Click a swatch to recolor.")
- Row: swatch (click → color picker, dispatch `markPackages` with new color) + path + file count + × (`unmarkPackage`)
- "Pin a folder color…": inline folder search (autocomplete over folder paths) that marks the chosen folder
- Section always shows the pin button; list renders only when packages exist

### 3. Tests + changelog

- Unit tests for new selector(s), band counts, and folder-override interactions
- `Changed` entry in `visualization/CHANGELOG.md`

## Steps

- [x] Complete Task 1: restyle existing controls into the mockup layout
- [x] Complete Task 2: folder overrides section
- [x] Complete Task 3: tests + changelog

## Review Feedback Addressed

1. **Invert/Reset placement**: Moved the Invert colors toggle + Reset colors row from the popover footer to between the Bands section and Folder Overrides.
2. **Reset scope**: `Reset colors` now also resets the gradient mode (`dynamicSettings.colorMode`) — outside delta mode only, since the control is not visible there.
3. **Picker light-dismiss bug**: Choosing a color closed the popover because the mat-menu picker rendered in a CDK overlay on `document.body`, outside the native `[popover]`, triggering light dismiss. Replaced with `cc-inline-color-picker`, which renders the `color-chrome` panel inside the popover DOM (fixed-positioned so it escapes the scrollable override list).
4. **Override list density**: Rows sit in a `gap-0.5` container capped at `max-h-36` (~5 rows) with `overflow-y-auto`; full path shown as tooltip on each row and each search suggestion.
5. **Folder search auto-close**: The search closes on blur when empty (typed terms keep it open); the suggestion list prevents the input blur on mousedown so clicking a suggestion with an empty term still pins it.
6. **Invert/Reset row sizing**: The row looked oversized next to the dense column — "Invert colors" now uses `text-sm` and the Reset colors button renders as `btn-sm` via a new opt-in `small` input on `cc-reset-settings-button` (other popovers keep the full-size default).

## Notes

- Band counts: `colorCategoryCounts$` (`ui/codeMap/codeMap.render.service.ts`) already tracks positive/neutral/negative node counts — reuse or derive a selector from `metricDataSelector` + `colorRangeSelector`
- Marked-package recoloring is no longer limited to the 5 `markingColors` — verify rendering and sidebar handle arbitrary hex colors
- Header reset icon resets thresholds only; footer "Reset colors" keeps its current behavior (colors + invert checkbox)
- Verified headless via Electron + Playwright (`xvfb-run`): popover layout, segmented gradient mode, band counts, pin/recolor/unpin folder overrides (pinned `/root` → count 8 across both sample maps), invert toggle, threshold reset. Delta-mode variant covered by unit tests only.
- New files: `colorBandRow.component.*`, `folderOverrides.component.*`, `markedPackagesWithCounts.selector.*`, `markableFolderPaths.selector.*` (all under `features/metricsBar/`); diagram got `diagramWidth`/`diagramHeight`/`showAxisLabels` inputs
- `npm run build`, full `npm test` (367 suites), and `npm run format:check` all pass
