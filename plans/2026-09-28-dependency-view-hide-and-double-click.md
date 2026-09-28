---
name: Dependency view: hide nodes, open folders by double click only
issue: -
state: complete
version: -
---

## Goal

Let readers hide a node from the dependency graph through the context menu (this view only, not
persisted), and drop the +/− glyph so folders open and close by double click alone.

## Tasks

### 1. Double click only
- Remove the glyph from the boxes and its click handling from the host

### 2. Hide in this view
- The node context menu offers actions a view contributes; the dependency view contributes "Hide"
- The dependency map's view store keeps the hidden paths; the graph leaves them and their edges out
- A new project or focus starts with nothing hidden

## Steps

- [x] Complete Task 1: Double click only
- [x] Complete Task 2: Hide in this view

## Notes

- Decided: view-local hiding for the spike; later it becomes the shared Exclude. No list to show hidden
  nodes again in this step
- The node context menu takes the actions a view contributes (`NODE_CONTEXT_MENU_VIEW_ACTIONS`), so it knows
  nothing about the dependency view
- Verified in a production build on CodeCharta's analysis: Hide in the menu, the emptied folder goes too
