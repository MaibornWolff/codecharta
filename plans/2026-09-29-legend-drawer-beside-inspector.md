---
name: Legend drawer moves aside only for an inspector
issue: -
state: complete
version: -
---

## Goal

Selecting a node in the dependency view pushed the legend drawer to the left, making room for an inspector that
only the metric view shows. The drawer should move aside only in a view that shows the inspector.

## Tasks

### 1. Let the view say whether the drawer sits beside the inspector
- The legend drawer takes `besideInspector` (default off); the metric view's legend panel turns it on
- The toggle button follows the drawer instead of reading the inspector itself
- Views stay alive across switches (route reuse), so counting mounted inspectors does not work

## Steps

- [x] Complete Task 1: Let the view say whether the drawer sits beside the inspector

## Notes

- Browser check: the dependency view's drawer stays at the right edge with a node selected; the metric view's drawer
  still moves aside for the inspector
