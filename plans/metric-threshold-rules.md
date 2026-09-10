---
name: metric-threshold-rules
issue: <none>
state: complete
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

### 7. Clearing rules
- A `Clear all N rules` in each list's footer, removing its metric, pattern and hand-picked rules
- `Reset filters` in Global Configuration, clearing both lists and nothing else
- Both behind the house confirmation, which is now one shared component

### 6. Distribution histogram
- Bucketing helper over the leaves' values for the chosen metric
- Small component: buckets, the matched range tinted, threshold marker

## Steps

- [x] Complete Task 1: generalise the rules list
- [x] Complete Task 2: model and state
- [x] Complete Task 3: matching and decoration
- [x] Complete Task 4: rules in the explorer lists
- [x] Complete Task 5: the editor
- [x] Complete Task 6: distribution histogram
- [x] Changelog entry
- [x] Complete Task 7: clearing rules (a Clear all per list, Reset filters in Global Configuration)
- [x] Address CodeRabbit review on #4537

## Review Feedback Addressed

1. **`bucketValues`**: `Math.min(...values)` throws on very large maps; bounds are found in one loop
2. **Editor thresholds**: a cleared input read as `0`; it now reads as no number and blocks submit
3. **Editor metric**: a chosen metric the reloaded map no longer has falls back to the first loaded one
4. **`metricRuleLeavesSelector` empty folders**: not changed — `NodeDecorator` applies rules by the
   same `isLeaf`, so filtering only the selector would make the counts disagree with the map

## Notes

- Only one caller of `NodeDecorator.decorateMap` (`accumulatedData.selector.ts`) — a clean seam
- Explorer counts read `leaf.isFlattened` / `leaf.isExcluded`, so they update for free once the
  decorator applies the rules
- Mockups: https://claude.ai/code/artifact/6dd42353-c1ab-46a9-ac2f-e1ee0624bf43
- An array in the state tree must be listed in `objectWithDynamicKeysInStore`
  (`stores/rootStore/state.manager.ts`) or the partial-state deep merge turns it into an object with
  numeric keys. Missing it broke "reset map" and was caught only by the e2e suite; there is now a
  unit test for it in `store.spec.ts`.
- Verified in the running app: `rloc > 50` on the sample files moves the chips from Shown 8 /
  Flattened 0 to Shown 2 / Flattened 6 and lists as `METRIC rloc > 50` with count 6.
- Several confirmation dialogs now live in the DOM at once, all descendants of the open Global
  Configuration dialog, so a test selector has to name the dialog it means — `dialog[open]` is not
  specific enough and `getByText("Yes")` is ambiguous.
