---
name: Fix the review findings of the dependency view's declarations
issue: -
state: complete
version: -
---

## Goal

Fix what the four independent reviews of `feature/dependency-declarations` found: bugs in the graph and the
inspector, code quality, comments and avoidable complexity.

## Tasks

### 1. Graph bugs
- Edge line dead after a selection, ▾ of an open box, missing declaration drawn to its own file
- Edge tooltip names, search marks and first look in Packages mode, declaration kind lookup
- Keyboard list: one tab stop, bring the focused box into view

### 2. Inspector bugs
- Only what the graph draws is listed, counted and linked (focus, excluded files)
- Replayed cycle request, returning graph selection, dismissed subject, parent link
- Edge count under another edge metric, "Open in graph" in a closed folder, row highlight, copy button
- Cycle search limit and cost, large edge tables

### 3. Structure and naming (structural commits)
- Finish the folder → container rename, one name per concept, no `Ref`
- One edge id helper, one "points upward" rule, shared grouping and path helpers, constants declared once
- Functions under 25 lines, repeated template markup extracted

### 4. Comments, tests, changelog
- Delete restating comments, move misplaced ones, name the non-obvious constraints
- Arrange/Act/Assert in every new test, tests that exercise what they claim
- Changelog entries: one change each

## Steps

- [x] Complete Task 1: Graph bugs
- [x] Complete Task 2: Inspector bugs
- [x] Complete Task 3: Structure and naming
- [x] Complete Task 4: Comments, tests, changelog

## Notes

- Left as it is, on purpose: the declaration paths of an edge are still put together where they are needed
  (one more field on every edge was not worth it), an edge's line style is still worked out per redraw (a
  handful of steps for an edge of one dependency), the hover stays in the view store, the state mocks in
  `dataMocks.ts` keep their spelled-out colours as every other setting there, and test names that tell several
  behaviours were split only where a test did not exercise what it claimed

- Each fix gets a failing test first; structural commits stay apart from behavioural ones
