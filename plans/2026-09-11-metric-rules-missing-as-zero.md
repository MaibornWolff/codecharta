---
name: Metric rules count a missing value as 0
issue: none
state: complete
version: vis-2.3.0
---

## Goal

A metric rule sees the same number the map shows: a file without a value for a metric that is on the
map counts as 0, so `mcc < 1` also catches files that have no mcc.

## Tasks

### 1. One source for every count (refactor, behaviour-neutral)
- The rules list counts from `metricValuesSelector` with `matchesMetricRule`, like the editor does

### 2. Missing value = 0 for metrics on the map
- `createMetricRuleMatcher(rules, metricsOnMap)`: absent value of a known metric evaluates as 0; a
  metric no file has still matches nothing
- `NodeDecorator.decorateMap` passes the `nodeMetricData` names; traversal order stays
- `metricValuesSelector` emits one value per file for every metric, 0 where absent
- Editor reads "N of M files"
- Update stale comments, CHANGELOG entry under Changed

## Steps

- [x] Complete Task 1: One source for every count
- [x] Complete Task 2: Missing value = 0 for metrics on the map
- [x] Unit tests, e2e `clearRules.e2e.ts`, check in the running app

## Notes

- Decision (user): "like the map", no per-rule toggle — anything else is confusing
- The views define "on the map" as "some file has the metric", the decorator as `nodeMetricData`
  (files not excluded by path). They differ only when every file carrying a metric is excluded by
  path; accepted
- The histogram now shows a large 0 bucket for metrics many files lack — correct under this model
- Verified on a fresh build (scratch copy with Linux `npm ci`; the repo's node_modules are darwin):
  default samples, `pairingRate < 1` reads "4 of 8 files" (the sample2 files without it) and moves
  the chips to Shown 4 / Flattened 4; sidebar explorer e2e green
