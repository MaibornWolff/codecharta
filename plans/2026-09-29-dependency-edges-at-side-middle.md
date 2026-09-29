---
name: Anchor dependency edges at the side's middle
issue: -
state: complete
version: -
---

## Goal

A setting that makes every dependency edge start and end at the middle of the box sides it runs between, on top
and bottom as well as left and right.

## Tasks

### 1. Middle anchoring in the routing
- A flag on the scene that puts every port at the side's middle, combined with any edge style
- The two edges of a dependency running both ways share their ends, so they bow apart as arcs

### 2. Toggle in the Edge style popover
- A checkbox "Start and end at the middle of the side" below the four styles, kept in the view store

## Steps

- [x] Complete Task 1: Middle anchoring in the routing
- [x] Complete Task 2: Toggle in the Edge style popover

## Notes

- Decided with the user: a separate toggle rather than a fifth style; cycles bow apart rather than overlap
- Browser check: with the toggle on, every edge meets its boxes at the middle; a stores/util cycle bows apart
