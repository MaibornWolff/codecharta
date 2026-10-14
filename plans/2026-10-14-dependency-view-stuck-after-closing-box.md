---
name: Dependency view stuck after closing a box
issue: -
state: complete
version: -
---

## Goal

After closing a large box in a zoomed-out dependency view and zooming out further, the graph sits in a corner
and cannot be panned until "Show whole graph" is used. Zooming out should always end with the graph centred and
unsquashed.

## Tasks

### 1. Centre the axes reach on the graph
- The axes reach stretches to hold a shown window that lies beyond the room around a graph that shrank; that
  reach is neither centred on the graph nor in the viewport's proportions, and zooming out fills it whole
- When the window lies beyond the room, grow the reach symmetrically around the graph, in viewport proportions

## Steps

- [x] Complete Task 1: failing test, fix, all checks green

## Notes

- ECharts' inside zoom clamps each axis to its extent on its own; once the window covers the extent, panning moves nothing
