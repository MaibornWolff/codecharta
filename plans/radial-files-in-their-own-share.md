---
name: Radial treemap files keep their own share
issue: none
state: complete
version: 2
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

### 2. Levels like the sunburst
- A folder's own files still shared its band with its sub-folder's files, so both filled the same depth
- One band per level below the centre, files included; a folder's children sit one band further out, the files as
  one block of cells in their share, a sub-folder as one solid piece across its band
- Only the outermost band keeps a header strip with a treemap of the folder's contents below it

## Steps

- [x] Revised after feedback: files first reached out to the rim, which still filled the deeper bands

- [x] Complete Task 1: Layout (TDD, radialTreemapLayout.spec.ts)
- [x] Complete Task 2: Levels like the sunburst (checked with screenshots of a 120 + 120 file map and the sample)
- [x] All checks green (format, test, lint, tsc)

## Notes

- Tried and dropped: capping every band at a third of the radius; it only thinned the shared band
- Folders with a band beyond them lose the thin header strip, as their whole band now shows the folder
