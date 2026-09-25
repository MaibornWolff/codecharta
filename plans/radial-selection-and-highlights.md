---
name: Radial maps show the selection, file-extension hover, kept highlights and marked folders
issue: none
state: progress
version: 1
---

## Goal

The sunburst and radial treemap gain what the 3D layouts already offer: the selected file is visibly marked, hovering
the file-extension bar highlights the matching files, and the context menu offers Keep Highlight and Mark folder.

## Tasks

### 1. Mark the selection
- The piece of the selected node is filled with the selection map colour, as the 3D map fills the selected building

### 2. Highlight a hovered file extension
- The hovered extensions move into transient shared state, written by the file-extension bar service
- The radial map keeps the matching files lit and fades every other piece, as the 3D map dims the other buildings

### 3. Keep Highlight in shared state
- The kept highlight moves out of `ThreeSceneService` into transient shared state (paths of the node and its
  descendants), which the 3D scene reads; the places that clear it today dispatch the clear instead
- The radial map lights the kept paths and fades the rest; the context menu offers the items in every layout

### 4. Mark folder
- Marked folders and their sub-folders take the mark colour instead of the folder-value colour; files keep theirs
- The context menu row and the folder overrides list in the colour popover show in the radial layouts too

### 5. Changelog
- Added entries in `visualization/CHANGELOG.md`

## Steps

- [x] Complete Task 1: Mark the selection
- [x] Complete Task 2: Highlight a hovered file extension
- [x] Complete Task 3: Keep Highlight in shared state
- [ ] Complete Task 4: Mark folder
- [ ] Complete Task 5: Changelog
- [ ] Run format check, tests, lint and type check

## Notes

- New shared-view keys are transient: never restored from IndexedDB, like the hovered and selected paths
