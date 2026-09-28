---
name: Sunburst and radial treemap grey out what the search misses
issue: none
state: complete
version: 1
---

## Goal

While the explorer search is active, the sunburst and radial treemap grey out the files the search misses, as the 3D
map does, and keep the folders on the way to a hit coloured.

## Tasks

### 1. Search-aware flatten predicate
- New render-model selector next to `flattenPredicateSelector`: the flatten rules, plus, while a search is active,
  every file that is not a hit and every folder with no hit inside
- A search without any hit greys out everything, as in 3D
- `flattenPredicateSelector` stays rules-only; the explorer, context menu and counts rely on that

### 2. Radial selectors use it
- `radialTreeSelector` and `radialFolderValuesSelector` take the new predicate, so folder colours come from the hits

### 3. Changelog
- Fixed entry in `visualization/CHANGELOG.md`

## Steps

- [x] Complete Task 1: Search-aware flatten predicate
- [x] Complete Task 2: Radial selectors use it
- [x] Complete Task 3: Changelog
- [x] Run format check, tests, lint and type check

## Notes

- The 3D map keeps its own `isNodeFlat`; its folders are grey anyway, so a folder there needs no "hit inside" rule
- Verified: all unit tests pass, format check and type check clean for the change, dependency-cruiser unchanged;
  knip could not run in the Linux sandbox (missing native oxc binding)
