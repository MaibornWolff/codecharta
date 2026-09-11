---
name: Flattened buildings stay flat
issue: -
state: complete
version: -
---

## Goal

A flattened building always renders at the minimum building height, whatever the height metric, its maximum, or
height inversion. Today it is drawn as if its height metric were 2, so it grows with the height scale and ignores
inversion. Delta rendering stays as it is.

## Tasks

### 1. Tests first
- Treemap: a flattened leaf is `MIN_BUILDING_HEIGHT` tall with a large height scale, also when inverted
- Treemap: a flattened leaf keeps its height delta
- Street layout: a flattened leaf is `MIN_BUILDING_HEIGHT` tall with a large height scale

### 2. Height of a flattened leaf
- `getHeightValue` stops special-casing flattened nodes
- Treemap and street `buildNodeFrom` use `MIN_BUILDING_HEIGHT` for a flattened leaf instead of scaling a fake
  metric value (treemap still multiplies by the map-size factor, like the floor of any other leaf)

### 3. Changelog
- Fixed entry in `visualization/CHANGELOG.md`

## Steps

- [x] Complete Task 1: Tests first
- [x] Complete Task 2: Height of a flattened leaf
- [x] Complete Task 3: Changelog

## Notes

- The flat branch has returned `MIN_BUILDING_HEIGHT` as a metric-space value since before 2020; no test pinned the
  resulting height.
- Delta mode keeps its behaviour: `heightDelta` of a flattened building is unchanged.
