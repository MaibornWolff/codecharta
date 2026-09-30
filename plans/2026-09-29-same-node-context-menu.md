---
name: The same node context menu in every view
issue: -
state: complete
version: -
---

## Goal

The node context menu looks the same in the Metric, Domain and Dependencies views: each offers a jump to every other
view that can show the node, and Exclude sits where the Metric view has it.

## Tasks

### 1. Jumps to every other view
- The menu offers every view but the one it is open in, in the view switcher's order; no per-view list to configure
- Domain only with domain data, Dependencies only for a node the graph can show

### 2. Exclude as in the Metric view
- A `showExclude` capability puts the Metric view's own Exclude entry into the dependency view, same place and look
- Drop the view-action mechanism the dependency view used for its Exclude; nothing else uses it

## Steps

- [x] Complete Task 1: Jumps to every other view
- [x] Complete Task 2: Exclude as in the Metric view

## Notes

- Decided with the user: every view jumps to every other view, and the menus share one configuration as far as possible
