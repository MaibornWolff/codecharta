---
name: Edge metric switch in the dependency view
issue: -
state: complete
version: -
---

## Goal

The dependency view drew every edge of `lenses.dependency.edges` as a dependency, although that list is shared with
other producers (gitlogparser's `temporal_coupling`) and only an edge carrying `dependencies` is one
(`dev_docs/cc-json-2.0-format.md`, "Reading the graph"). Let the reader pick the edge metric the view draws.

## Tasks

### 1. Draw the edges of one metric
- Only edges carrying the chosen metric, weighted by its value; the cycle and upward flags count only for
  `dependencies`, every other metric draws neutral
- Cycles and Upward fall back to All for another metric; widths grow relative to the lightest shown edge
- Tooltip names the metric and its value for another metric

### 2. Edge metric card
- First card of the Dependency bar, reusing the shared metric picker; it reads and sets the Metric view's edge
  metric, so both views follow one choice
- Edges shown disables Cycles and Upward while another metric is chosen; the legend follows the metric

## Steps

- [x] Complete Task 1: Draw the edges of one metric
- [x] Complete Task 2: Edge metric card

## Notes

- Decided with the user: shared with the Metric view; another metric neutral with arrowheads
- Cause found in the user's map (Ideas/codecharta.cc.json.gz): 4,196 temporal_coupling-only edges drawn as
  dependencies, 449 pointing up; every upward dependency is flagged
- Browser check with the user's map: with `dependencies`, app.config.ts only points down; with
  `temporal_coupling` its co-change edges to the explorer files show neutral, the legend names the metric
