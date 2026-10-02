---
name: Focus in the dependency view's context menu and dependency bar popovers designed like the metrics bar's
issue: -
state: complete
version: -
---

## Goal

A folder can be focused from the context menu of the dependency view, and the dependency bar's cards open their
choices and settings the way the metrics bar's cards do: the name picks the value, the cog opens the settings.

## Tasks

### 1. Focus in the context menu
- The menu's capabilities say which nodes a view can focus: none (domain), folders (dependencies), folders and files
  (metrics)
- The dependency view offers Focus on folders, Unfocus / Unfocus Parent / Unfocus All as the metrics view does, in the
  graph and in the explorer; highlight, flatten and folder colors stay with the metrics view

### 2. Edge style card split like the Folders card
- Clicking the name opens a pick-list of the four styles: label, description, check mark on the chosen one
- A cog opens the settings: side-middle checkbox, line thickness, width factor, reset button
- Titles, section labels, checkbox, spacing and reset button as in the metrics bar's popovers

### 3. Edges shown popover
- Text size and spacing of the list match the metrics bar's lists

### 4. Verify
- Unit suite, type check, format check, lint; before/after screenshots; changelog

## Steps

- [x] Complete Task 1: Focus in the context menu
- [x] Complete Task 2: Edge style card split like the Folders card
- [x] Complete Task 3: Edges shown popover
- [x] Complete Task 4: Verify

## Notes

- Decided with the user: split the edge style card, Focus on folders only, only Focus joins the menu, changes stay
  uncommitted
- A focused file would be one box without edges, hence folders only
