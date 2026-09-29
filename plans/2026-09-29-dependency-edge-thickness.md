---
name: Line thickness option for dependency edges
issue: -
state: complete
version: -
---

## Goal

Let the reader choose how thick the dependency edges are drawn, from the Dependency bar.

## Tasks

### 1. Edge width in the renderer
- A width is a thickness (By count / Thin / Uniform / Strong) and a factor that scales it
- The arrow head grows with a wide line

### 2. Line thickness card
- A third card in the Dependency bar listing the four thicknesses, with a width factor slider (0.25–3) below them
- The choice lives in the view store like the edge filter and style

## Steps

- [x] Complete Task 1: Edge width in the renderer
- [x] Complete Task 2: Line thickness card

## Notes

- Decided with the user: fixed choices, and a slider as well
- Browser check: By count, Strong, Thin and Thin ×3 all redraw the edges; the card names the choice
