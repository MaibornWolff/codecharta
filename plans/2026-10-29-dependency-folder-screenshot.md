---
name: Screenshot of one folder in the dependency graph
state: complete
version: 1
---

## Goal

Right-click a folder in the dependency view (its box in the graph or its row in the explorer) and take a
screenshot of only that folder's box, as it looks now.

## Tasks

### 1. Locate a box on screen
- The dependency graph registers a lookup with its chart registry: box path → pixel rect of the drawn box
- No rect when the folder has no box of its own (inside a closed folder) or the box lies outside the view

### 2. Crop the screenshot to the box
- Render the chart at twice the device pixel ratio, crop to the box's rect (clipped to the view)
- Output follows the screenshot setting: clipboard when enabled and allowed, else a PNG file named after the
  map and the folder; a toast reports the outcome

### 3. Context menu entry
- "Screenshot Folder" in the dependency view, for folders whose box is drawn and in view
- Works from the graph and from the explorer (both open the same menu)

### 4. Setting: highlight on hover
- New dependency graph setting, on by default; off means no hover outline, no edges appearing, rising or
  dimming because of a hover (the tooltip stays)
- In the edge settings popover next to "Respect on hover"; saved sessions get the default via a migration

### 5. Folder screenshot without edges leaving the folder
- Still the current view, but drawn once more off screen with only the edges that start and end inside the
  folder, then cropped to the box; the live graph stays untouched

## Steps

- [x] Complete Task 1: Locate a box on screen
- [x] Complete Task 2: Crop the screenshot to the box
- [x] Complete Task 3: Context menu entry
- [x] Complete Task 4: Setting: highlight on hover
- [x] Complete Task 5: Folder screenshot without edges leaving the folder

## Notes

- Decisions: box as it looks now, edges leaving it left out (round 2; first round cut them at the border), output per screenshot setting,
  folders in graph and explorer, on top of the local-source PoC branch
- Package boxes (packages hierarchy) are no map nodes and open no context menu, so they get no entry
- A box only partly in view is captured as far as it is in view
- Browser smoke (Playwright, sample maps): entry shows, PNG named after the folder; with the highlight off the
  hovered box is drawn plain; ParentLeaf's shot has no edges leaving it while the live graph keeps them
- Saved sessions get the new setting through migration v35
