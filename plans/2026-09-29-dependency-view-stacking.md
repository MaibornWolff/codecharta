---
name: Dependency view: stacking and level bands of moved boxes
issue: -
state: complete
version: -
---

## Goal

Dragged boxes stack correctly over what they cover, and level bands follow the boxes of their level.

## Tasks

### 1. Bands follow their boxes
- A level band knows its boxes; after moves it spans exactly them

### 2. Paint in tree order
- One series paints each folder, then its bands, then its children; a dragged box and everything in it paint
  above its siblings, the most recently dragged on top
- Edges paint above all boxes (superseded by task 3); a click, press or right click on an edge lying over a
  box goes to that box

### 3. Edges in the paint order
- An edge paints right after the later of its two end boxes, so a covered folder's edges are covered with it;
  the hovered box's edges stay on top

## Steps

- [x] Complete Task 1: Bands follow their boxes
- [x] Complete Task 2: Paint in tree order
- [x] Complete Task 3: Edges in the paint order

## Notes

- Four global layers (open folders, bands, edges, files) cannot stack a moved folder over another folder's
  files; tree order can, and then edges must go on top
- Browser check of the stacking pending: no scratch directory for a production build this session
- An edge to a box painted later stays above whatever that box's siblings cover; it enters the box it belongs to

