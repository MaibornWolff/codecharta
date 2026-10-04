---
name: Edge height follows the map size
issue:
state: complete
version:
---

## Goal

Edges in the 3D map arch in proportion to the size of the map shown, so they no longer tower over a
small map such as a focused folder.

## Tasks

### 1. Make the edge lift relative
- The lift above the buildings is a fraction of the shown map's size times the Edge Height setting,
  instead of a fixed number of map units
- The fraction keeps whole-project maps close to how they looked

## Steps

- [x] Complete Task 1: Make the edge lift relative
- [x] Run format, tests, lint and type check
- [x] Update the changelog

## Notes

- Decisions (asked): relative to the size of the shown map rather than to the distance between the
  buildings; applies to every map, focused or not
- The fraction (1.25 % of the map size per Edge Height step) is derived from typical map widths, not
  tuned by eye
