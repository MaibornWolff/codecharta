---
name: Metric range respects excludes
issue: <#issueid>
state: complete
version: 1
---

## Goal

The metric min/max (node metric data) must be calculated over the files the map actually shows, so
that excluding by metric rule and excluding with several maps loaded change the range, the color
slider and the inspector's range bar the same way they change the map total.

## Tasks

### 1. Calculate node metric data from the structure tree

- `calculateNodeMetricData` walks the raw visible files, whose leaf paths lack the file-name prefix
  that the aggregated tree (and therefore every blacklist path) carries — so with several maps
  loaded no exclude ever matches.
- Take the leaves from `structureTreeSelector` instead: same tree the map is built from, so the path
  space can no longer disagree.
- Consequence to note: in delta mode the range then covers the delta map's values (the comparison
  values) instead of the union of both files' raw values.

### 2. Apply metric rules to the range

- `nodeMetricDataSelector` does not read `metricRulesSelector`, so a rule like `rloc > 50` shrinks
  the map total but leaves min/max untouched.
- Two passes inside the calculator: collect the metric names first (path excludes only), build the
  metric rule matcher from those names, then collect values/min/max over the leaves the rules keep.
- Keep every metric name from the first pass in the result, even when all its files are rule
  excluded: `NodeDecorator` derives its `metricsOnMap` from these names, so dropping a name would
  stop the rule from matching on the map.

### 3. Tests

- Calculator: metric rule shrinks min/max/values; a metric whose files are all rule excluded keeps
  its entry; blacklist path with several maps loaded excludes the right leaf.
- Selector: projector takes the structure tree and the rules.
- Update the existing calculator/selector specs to the new input.

### 4. Changelog

- One Fixed entry in `visualization/CHANGELOG.md`.

## Steps

- [x] Complete Task 1: Calculate node metric data from the structure tree
- [x] Complete Task 2: Apply metric rules to the range
- [x] Complete Task 3: Tests
- [x] Complete Task 4: Changelog
- [x] Run format:check, unit tests, lint and tsc

## Notes

- Found while checking the inspector's map/range bars. Two further findings are NOT part of this
  plan: a folder's range bar is always full (folder value is a sum, range is over single files), and
  median-based metrics get a meaningless map bar.
- The edge metric calculator reads the raw files the same way, so its range has the same multi-map
  blind spot. Out of scope here.
