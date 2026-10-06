---
name: Make the dependency view's inspector a drawer the legend moves aside for
issue: -
state: complete
version: -
---

## Goal

The LEGEND tab and its panel of the dependency view move left while the view's inspector is shown, as they do in the
metrics view. The metrics view keeps behaving as it does.

## Tasks

### 1. Legend drawer told by its view
- The drawer no longer asks the metrics inspector itself; each view tells it whether an inspector takes the right edge
- The metrics legend passes on the metrics inspector, the dependency view its own inspector

### 2. Inspector as a drawer
- The dependency inspector slides in over the right edge like the metrics inspector, instead of popping in as a column
- It lies over the graph, which keeps its full width, as the metrics inspector lies over the map

### 3. Inspector details
- The cycle search runs to its end: no limit, no warning that there may be more cycles
- "Show in graph" stays inside its cycle card when a file name is long

## Steps

- [x] Complete Task 1: Legend drawer told by its view
- [x] Complete Task 2: Inspector as a drawer
- [x] Complete Task 3: Inspector details
- [x] Format check, tests, lint, type check
