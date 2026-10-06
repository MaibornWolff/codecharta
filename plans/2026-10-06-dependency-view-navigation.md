---
name: dependency-view-navigation
issue: none
state: complete
version: 1
---

## Goal

Moving around the dependency graph works from anywhere, and opening or closing a box no longer leaves the reader looking at the wrong place.

## Tasks

### 1. Pan with Space
- A press on a box drags it, so only the background pans. Holding Space while the pointer is over the graph makes every drag pan, with a grab cursor.
- Space typed into a field, or handled by the keyboard box list, stays theirs.

### 2. Hold the toggled box in place
- The box that is opened or closed keeps its spot on screen at the same zoom after the graph is laid out again.
- An opened box that does not fit is shown whole: slid into view, or zoomed out just enough.

## Steps

- [x] Complete Task 1: Pan with Space
- [x] Complete Task 2: Hold the toggled box in place
- [x] Changelog, checks
