---
name: Dependency edges pass under the boxes
issue: -
state: complete
version: -
---

## Goal

In a graph with many dependencies the edges covered the boxes and their names. Edges should run over the open
folders' backgrounds but under every closed box and every name, hovered or not.

## Tasks

### 1. Paint in three layers
- Open folders and level bands, then the edges, then the closed boxes and the open folders' names
- An open folder's name becomes its own item, painted apart from the folder; each layer keeps the paint order
- Hit testing follows the same order, so a click lands on the box the reader sees on top

## Steps

- [x] Complete Task 1: Paint in three layers

## Review Feedback Addressed

1. **Hide / show again**: boxes that reappeared were painted over everything and the edges over the other boxes,
   because ECharts paints elements it creates in a later draw on top. Every element now carries its place in the
   paint order as its z2.

## Notes

- Decided with the user: boxes above edges (no routing around boxes); hovered edges stay under the boxes too
- Browser check on the CodeCharta sample: all names readable, hover still lights the box's edges
