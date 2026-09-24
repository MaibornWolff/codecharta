---
name: Sunburst draws its labels like the radial treemap
issue: none
state: complete
version: 1
---

## Goal

The sunburst shows the same labels as the radial treemap (curved along wide arcs, upright along narrow ones),
from the same code instead of a second label implementation.

## Tasks

### 1. Share the radial treemap's drawing (structural)
- Move the custom-series option (pieces, labels, borders, tooltip, animation) into one builder both layouts use
- Rename the treemap-only element/label/placement names that become shared

### 2. Draw the sunburst with it (behavioural)
- Lay out the sunburst as placed sectors: one ring per level, largest first, as ECharts did
- Keep the sunburst's hover: the hovered segment and its ancestors stay lit (focus as data indices)
- Drop the native sunburst series and the chart size input only it needed

## Steps

- [x] Complete Task 1: Share the radial treemap's drawing
- [x] Complete Task 2: Draw the sunburst with it
- [x] Checks: format, tests, lint, tsc

## Notes

- ECharts accepts an array of data indices as an element's `focus`; that is how its sunburst's `ancestor` focus works
