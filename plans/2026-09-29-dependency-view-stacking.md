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
- Edges paint above all boxes; a click, press or right click on an edge lying over a box goes to that box

## Steps

- [x] Complete Task 1: Bands follow their boxes
- [x] Complete Task 2: Paint in tree order

## Notes

- Four global layers (open folders, bands, edges, files) cannot stack a moved folder over another folder's
  files; tree order can, and then edges must go on top
- Browser check of the stacking pending: no scratch directory for a production build this session

