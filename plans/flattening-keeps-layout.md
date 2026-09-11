---
name: Flattening keeps the layout
issue: -
state: complete
version: -
---

## Goal

Flattening or unflattening buildings changes only their height and colour. Today the map canvas shrinks with every
flattened node, because the estimate of nodes per side counts flattened nodes as removed, so the whole layout shifts.

## Tasks

### 1. Tests first
- Treemap and fixed-folder layouts give every node the same footprint with and without flattened leaves

### 2. Count only excluded nodes
- `getEstimatedNodesPerSide` subtracts excluded nodes only; flattened nodes keep their area and their place

### 3. Changelog
- Fixed entry in `visualization/CHANGELOG.md`

## Steps

- [x] Complete Task 1: Tests first
- [x] Complete Task 2: Count only excluded nodes
- [x] Complete Task 3: Changelog

## Notes

- Flattened nodes were counted since the 2020 split of `isBlacklisted` into `isExcluded`/`isFlattened` (`468158702`).
