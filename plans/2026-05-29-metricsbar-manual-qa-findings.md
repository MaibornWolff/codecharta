---
name: metricsbar-manual-qa-findings
issue: ""
state: progress
version: <next>
date: 2026-05-29
branch: fix/explorer-sort-dropdown-auto-close
topic: "Manual QA findings from operating the metricsBar redesign + review fixes"
tags: [plan, visualization, metricsBar, qa, manual-test]
---

# MetricsBar manual QA findings

## Goal

Capture findings reported while manually operating the app (http://localhost:4200), triage each,
and fix. The user operates; this doc is the running log.

## Findings

<!-- One entry per reported finding. Status: open -> fixing -> fixed (or wontfix). -->

| # | Area | Finding | Repro | Severity | Status |
|---|------|---------|-------|----------|--------|
| 1 | Map selector / Explorer | Map selection popover renders **behind** the File Explorer sidebar; should be in front | Open the map selector dropdown (top bar) while the explorer sidebar overlaps it | Medium | fixed |
| 2 | Explorer / Bottom bar | Side explorer extends **over** the bottom bar; should stop above it | Expand explorer; it overlaps the bottom bar at the viewport bottom | Medium | fixed |
| 3 | Color segment ramp | Mini color ramp showed wrong colors (e.g. red on the left for a non-inverted metric like complexity) when the visible range differed from the global range (hover/focus a folder, flatten/exclude rules) | Hover/focus a high-value folder; the ramp re-scaled to that subtree but kept global thresholds → bins mis-colored | Medium | fixed (Option A) |

## Details / Fixes

<!-- Per-finding notes: root cause, files touched, fix approach, verification. -->

### Finding 1 — Map selector popover behind explorer (fixed)
- **Root cause:** navbar isn't a stacking context, so the dropdown's `z-50` competed directly with the explorer drawer's `z-[60]` in the root stacking context → explorer won.
- **Fix:** bumped the navbar dropdown menus to `z-[70]` (above the `z-[60]` drawer). Applied to both `mapSelector.component.html` and `deltaSelector.component.html` (same root cause / same `z-50`).
- **Verify:** open the map selector (and delta selectors) with the explorer open — the menu renders in front.

### Finding 3 — Color ramp mis-colored (fixed, Option A)
- **Root cause:** the ramp binned/scaled its 12 bars over `visibleNodeMetricValuesSelector` (visible leaves, narrowed to hover/focus, excludes flatten/exclude) but colored them with `colorRange` thresholds derived from `selectedColorMetricDataSelector` (global metric range). When the two ranges diverged (hover/focus a subtree, flatten/exclude), `from`/`to` no longer aligned with the bins → wrong bar colors (e.g. red on the left for complexity). The popover diagram looked right because it uses one source (`selectedColorMetricData`) for both bars and thresholds.
- **Fix (Option A):** keep the **visible** bar *heights*, but bin them on the **global** color-metric axis (`selectedColorMetricData` min/max — same range the thresholds use). `histogramBins` now accepts an optional explicit `{min,max}` range; `axisColorRamp` passes it; `colorSegment` feeds global min/max (axis + min/max labels) while still passing visible `values` for the heights.
- **Files:** `util/histogramBins.ts` (+spec), `axisColorRamp.component.ts`, `colorSegment.component.ts`.
- **Verify:** hover/focus a high-value folder — bars now cluster on the correct side of the global axis with correct colors (low=green, high=red for complexity), matching the 3D map and the popover.

### Finding 2 — Explorer overlaps bottom bar (fixed)
- **Root cause:** expanded explorer height was `calc(100vh - var(--cc-bars-height))`, spanning to the viewport bottom over the `fixed bottom-0 z-10` bottom bar.
- **Fix:** subtract the published bottom-bar height: `calc(100vh - var(--cc-bars-height, 98px) - var(--cc-bottom-bar-height, 32px))` in `sidebarExplorer.component.ts` host binding.
- **Verify:** expand explorer — its bottom edge now stops above the bottom bar.

## Steps

- [ ] Collect findings
- [ ] Triage + fix each
- [ ] Re-test (tsc + npm test + manual re-check)
- [ ] Update CHANGELOG if any user-facing behavior changed

## Notes

- Dev server running on 0.0.0.0:4200 (watch mode).
