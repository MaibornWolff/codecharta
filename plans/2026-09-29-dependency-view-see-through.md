---
name: Dependency view: see-through overlapping folders, reachable view
issue: -
state: complete
version: -
---

## Goal

Overlapping folders show what lies behind them instead of hiding it, level bands never mix across folders,
edges are never hidden while their boxes show, and the whole graph stays reachable after dragging.

## Tasks

### 1. Edges on top
- Edges draw above every box again, in severity order, the hovered box's on top

### 2. See-through where folders overlap
- A folder painted over an unrelated box it overlaps turns see-through; so does the folder being dragged

### 3. Level bands give way
- A separator stops where a box painted over it and outside its folder covers it; a label under such a box
  is left out

### 4. Reachable view
- The axes span the laid-out graph with room around it, fixed while dragging, so a grown graph stays in reach
- The first look and "Show the whole graph" fit everything, moved boxes included

## Steps

- [x] Complete Task 1: Edges on top
- [x] Complete Task 2: See-through where folders overlap
- [x] Complete Task 3: Level bands give way
- [x] Complete Task 4: Reachable view

## Notes

- Decided (asked): see-through only where overlapping and while dragging; bands hidden under others; edges on
  top; the view reaches everything and fits it on demand
- The overlap analysis runs only once something was moved; the laid-out graph never overlaps
- The axes reach the graph plus its own size on every side and do not change while dragging, so the view does
  not shift under the pointer; a new graph is fitted once on arrival
- Not checked in a browser this session: no scratch directory for a production build

