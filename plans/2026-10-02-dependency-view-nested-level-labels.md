---
name: Level labels in the dependency view name the levels of the folders around them
issue: -
state: complete
version: -
---

## Goal

A level band inside a nested folder reads as the chain of levels leading to it, e.g. `level 0.1.2`, so the reader sees
where in the map the band sits. Frontend only: the chain is built from the per-node levels the file already carries.

## Tasks

### 1. Level paths in the layout
- Every box and band carries the levels of the boxes around it, outermost first; a folded folder chain counts once
- The band label and the box tooltip show the chain; the root box, which has no level, shows none

### 2. Focus keeps counting from the root
- While focused on a folder, the chain starts with the levels leading from the map's root to that folder

### 3. Verify
- Unit suite, type check, format check, lint; screenshot; changelog

## Steps

- [x] Complete Task 1: Level paths in the layout
- [x] Complete Task 2: Focus keeps counting from the root
- [x] Complete Task 3: Verify

## Notes

- A folder the parser gave no level sits at level 0 of its parent, so a `0` in the chain can also mean "no level given"
- Counting from the real root while focused was chosen without asking: it answers "where am I" in the whole map
- Superseded in part: the path is opt-in, see 2026-10-02-dependency-level-label-switch-and-side-middle.md
