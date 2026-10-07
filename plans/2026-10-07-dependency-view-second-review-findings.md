---
name: Check the second round of review findings on the dependency view
issue: -
state: complete
version: -
---

## Goal

Verify six review findings against the current code and fix the ones that still hold.

## Tasks

### 1. Declaration edges without a file edge
- A dependency between two files that the map tells no file edge for is drawn, on its own flags

### 2. Findings left as they are
- Cycle search off the UI thread or partial: the limit was removed on purpose after trying a large map
- Every simple cycle instead of the shortest way back: the documented contract is the shortest way back
- Space on a focused control: panning wins on purpose while the pointer is over the graph
- Edge containment by the drawn tree, stale cycles request: fixed earlier

## Steps

- [x] Complete Task 1: Declaration edges without a file edge
- [x] Complete Task 2: Findings left as they are
- [x] Format check, tests, lint, type check
