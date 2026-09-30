---
name: Fix the selected findings of the second dependency view review
issue: -
state: complete
version: -
---

## Goal

Fix the second review's findings the user picked: a zoom that stays put, merged folders that can be selected, no
blocking spinner in the dependency view, a lazily built domain index, and fewer narrating comments.

## Tasks

### 1. Zoom that stays put
- Opening, closing or excluding a folder, dragging and resizing keep the reader's zoom and position; a resize keeps
  the centre and pixels per unit instead of squashing the graph
- Refit to the whole graph only on a new file, on 'Show in Dependencies' and on the reset button (`fitRequest` input)

### 2. Dependency view behaviour
- Opening a jumped-to node requests a refit, and a node outside the current focus clears the focus on arrival
- An exclusion that moves the graph's top box opens the new top box
- Folders merged into a chain box map onto that box for selection, hover and jumps
- The dependency view clears the pending heavy dispatch once it has drawn, so rule changes no longer block it
- Narrating comments removed in the bar segments, the series and the dependency graph model

### 3. Lazy domain index and view-change spinner
- The node context menu resolves the paths with domain words only while it is open
- A spinner covers a switch between views until the target view is ready

### 4. Verify and commit
- Full unit suite, type check, format check, knip, dependency-cruiser, e2e; commit per task

## Steps

- [x] Complete Task 1: Zoom that stays put
- [x] Complete Task 2: Dependency view behaviour
- [x] Complete Task 3: Lazy domain index and view-change spinner
- [x] Complete Task 4: Verify and commit

## Notes

- Decided with the user: keep zoom on toggle, open the new top box, unfocus on arrival, lazy domain index with a
  view-change spinner; no change for hover performance, click jitter, drag performance or the other review items
