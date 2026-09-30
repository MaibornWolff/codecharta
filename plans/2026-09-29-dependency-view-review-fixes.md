---
name: Fix the dependency view review findings
issue: -
state: complete
version: -
---

## Goal

Fix every finding of the branch review (bugs, performance, code quality) before the dependency view goes to
production.

## Tasks

### 1. Renderer layout and drawing helpers (wave 1)
- Quadratic overlap check and list building, NaN zoom window, Math.min/max spreads, long methods, shared geometry
  types and containment helper, magic numbers, narrating comments, missing Arrange comments

### 2. Shared UI (wave 1)
- Context menu: no Dependencies jump in compare mode, per-node Domain jump, dead optional explorer, divider template
- Legend drawer renders its content only while open; view switcher tabs from a list; storage scope uses ViewId;
  shared redirect-away helper; split header tooltip test

### 3. Map explorer consolidation (wave 1)
- Search, sort, tree and handed-over-node shared by Metric and Dependencies views; a sound home for the shared
  explorer code; dependency-cruiser comment

### 4. Renderer interaction (wave 2)
- First click after a drag is swallowed, resize before every render, hover on an edge, private ECharts flag,
  attachTo length, shared point type

### 5. Dependency feature and layout identity (wave 2)
- Layout keyed on the loaded files and focus (no leak between files, exclusions keep the layout, refit on a new map)
- Reveal of a handed-over node survives the first adoption; empty-graph message with Unfocus; edge projection out of
  the hover path; DraggedBox names, generic Choice, model types instead of aliases, comments and Arrange comments

### 6. Verify and commit
- Changelog entry shortened; full unit suite, type check, format check, knip, dependency-cruiser, e2e; commit per task

## Steps

- [x] Complete Task 1: Renderer layout and drawing helpers
- [x] Complete Task 2: Shared UI
- [x] Complete Task 3: Map explorer consolidation
- [x] Complete Task 4: Renderer interaction
- [x] Complete Task 5: Dependency feature and layout identity
- [x] Complete Task 6: Verify and commit

## Notes

- Agents own disjoint files and run only the tests for what they touch; the full checks run once at the end
