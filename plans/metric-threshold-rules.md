---
name: metric-threshold-rules
issue: <none>
state: progress
version: 1
---

## Goal

Flatten or exclude files by a metric threshold, from the explorer, alongside the pattern and
hand-picked rules that already live there. A rule reads as what it removes: `mcc > 10` flattens
every file above 10.

## Decisions

- Files (leaves) only — folders are never matched by a metric rule
- Several rules can be active at once; each independently flattens or excludes what it matches
- A rule is a live predicate in state, re-evaluated on every render; it does not expand to paths
  and does not round-trip through the cc.json blacklist
- A file with no value for the metric is never matched
- Operators: `>` `>=` `<` `<=` `=` and `between` (both ends inclusive)
- The editor ships with the distribution histogram

## Tasks

### 1. Generalise the rules list (structural, no behaviour change)
- `RuleWithCount` becomes `{ id, kind, label, affectedCount }`, `removeRule(id)`
- Lets one row component render pattern, manual and metric rules

### 2. Model and state
- `MetricRule { id, metric, operator, value, upperValue?, type }` in the domain model
- `sharedView.metricRules` slice: actions, reducer, selectors

### 3. Matching and decoration
- `metricRuleMatcher` classifies a leaf from its attributes; missing value never matches
- `NodeDecorator.decorateMap` ORs it into `isFlattened` / `isExcluded`, before metrics are
  defaulted to 0, so a missing value stays missing
- `accumulatedDataSelector` passes the rules

### 4. Rules in the explorer lists
- Metric rules appear in the Flattened / Hidden popovers with their affected count and a remove
- New `METRIC` kind badge

### 5. The editor
- `EXPLORER_METRIC_RULES` port, provided by the metrics view only, gated by a capability
- Editor popover: metric, operator, value(s), live count, histogram, add
- Entry points: the search row's menu and the empty rules popover

### 6. Distribution histogram
- Bucketing helper over the leaves' values for the chosen metric
- Small component: buckets, the matched range tinted, threshold marker

## Steps

- [ ] Complete Task 1: generalise the rules list
- [ ] Complete Task 2: model and state
- [ ] Complete Task 3: matching and decoration
- [ ] Complete Task 4: rules in the explorer lists
- [ ] Complete Task 5: the editor
- [ ] Complete Task 6: distribution histogram
- [ ] Changelog entry

## Notes

- Only one caller of `NodeDecorator.decorateMap` (`accumulatedData.selector.ts`) — a clean seam
- Explorer counts read `leaf.isFlattened` / `leaf.isExcluded`, so they update for free once the
  decorator applies the rules
- Mockups: https://claude.ai/code/artifact/6dd42353-c1ab-46a9-ac2f-e1ee0624bf43
