---
name: Dependency view: explorer, dependency bar, legend drawer
issue: -
state: complete
version: -
---

## Goal

The dependency view gets the sidebar explorer, a bottom bar for its edge settings and the legend drawer,
reusing what the metric and domain views already have.

## Tasks

### 1. Legend drawer
- Extract the LEGEND toggle, panel and outside-click closing from the metrics legend into a drawer that
  takes its content

### 2. Shared map explorer search and sort
- The dependency view points its own explorer search and sort configs at the metric view's selectors (the
  sidebar explorer must stay view-agnostic, and views cannot import each other)

### 3. Conditional view actions
- A context menu view action says for which node it is offered

### 4. Dependency explorer
- Whole file tree; rows without a box in the graph greyed out; shared search and sort, a search fades the
  boxes it misses; selecting reveals the box in the graph; hovering a row lights up its box; hidden nodes
  stay greyed with Show again

### 5. Dependency bar, toolbox, legend
- Edge filter and edge style in a bottom bar built like the domain bar; Show the whole graph and Reset layout
  as a toolbox top right; edge legend in the legend drawer

## Steps

- [x] Complete Task 1: Legend drawer
- [x] Complete Task 2: Shared map explorer search and sort
- [x] Complete Task 3: Conditional view actions
- [x] Complete Task 4: Dependency explorer
- [x] Complete Task 5: Dependency bar, toolbox, legend

## Notes

- Decided (asked): whole file tree with rows greyed like in metrics; search and sort shared with the metric
  view; reveal, show again and hover linking; filter and style in the bar, the rest top right
