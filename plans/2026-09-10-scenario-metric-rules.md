---
name: scenario-metric-rules
issue: <none>
state: complete
version: 1
---

## Goal

Scenarios save and apply the metric rules (flatten or hide files by a metric condition) as part of
their Filters, next to the excluded and hidden nodes.

## Tasks

### 1. Registry entry
- `metricRules` setting in the `filters` group, between `blacklist` and `focusedNodePath`
- Reads and patches `sharedView.metricRules` as a whole array, like `blacklist`

### 2. Tests
- Registry: the patch replaces `sharedView.metricRules`; the filters group lists the new key
- Applier: a scenario carrying rules patches them into `sharedView`

### 3. Changelog
- Extend the unreleased metric rule entry: scenarios keep the rules

## Steps

- [x] Complete Task 2: failing tests
- [x] Complete Task 1: registry entry
- [x] Complete Task 3: changelog
- [x] Full `npm test` green

## Notes

- No schema version bump: an optional key in a v2 file stays readable, and older versions ignore it
- On by default in the save dialog (only the camera is opt-in); an empty list is saved too, so
  applying clears rules the scenario did not have. Scenarios saved before lack the key and leave
  the current rules alone, as for every other setting
- The missing-metrics warning is left as is: a rule on a metric the map lacks matches nothing
