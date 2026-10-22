---
name: Label defaults
state: complete
version: 1
---

## Goal

New label defaults, also applied by "Reset label settings": top 10 labels, all maps, size 1.25, height mode, node
names shown, metric values shown, overlapping labels grouped.

## Tasks

### 1. Defaults
- `defaultLabelSize` 1 → 1.25, `defaultShowMetricLabelNameValue` false → true; the others already match

### 2. Specs and changelog
- Specs asserting the old defaults; Changed entry in `visualization/CHANGELOG.md`

## Steps

- [x] Complete Task 1: Defaults
- [x] Complete Task 2: Specs and changelog

## Notes

- Branched from `fix/dependency-view-needs-edge-metrics`
- Settings already stored in a reader's browser keep their value until reset
