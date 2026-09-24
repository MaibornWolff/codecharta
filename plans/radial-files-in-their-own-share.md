---
name: Radial treemap files keep their own share
issue: none
state: complete
version: 1
---

## Goal

In the radial treemap a folder's own files are squarified across the folder's whole angle, so they run over the
angle of its sub-folders. Match the sunburst: files only take their own angular share, sub-folders theirs.

## Tasks

### 1. Layout
- Below a folder's header, split the body by angle like the centre's children: each sub-folder gets one cell lined
  up with its own wedge in the next band, the files one block of cells that stays inside the folder's band (the
  centre's files inside the first band), leaving the deeper bands empty at their angle as the sunburst does
- The deepest band keeps the squarified treemap of all children (no band below it)

## Steps

- [x] Revised after feedback: files first reached out to the rim, which still filled the deeper bands

- [x] Complete Task 1: Layout (TDD, radialTreemapLayout.spec.ts)
- [x] All checks green (format, test, lint, tsc)
