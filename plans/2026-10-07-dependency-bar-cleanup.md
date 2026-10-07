---
name: Dependency bar cleanup
issue: n/a
state: complete
version: n/a
---

## Goal

Trim the dependency bar: declarations are always stacked and marked by an icon, the cycle-count checkbox moves
into the Levels popover, and the hierarchy choice is saved with the session.

## Tasks

### 1. Remove the declaration arrangement and kind mark
- Drop `declarationArrangement` and `declarationKindMark` from the settings, the scene and the renderer
- Delete the code only List, Chips, Shape, Tint and Off needed, with its tests
- Drop the stored keys in a session migration

### 2. Move the cycle-count checkbox
- Delete the Declarations card
- Show the checkbox under Number/Path in the Levels popover

### 3. Save the hierarchy
- Move Folders/Packages from the model store's signal into `preferences.dependencyGraph`

## Steps

- [x] Complete Task 1: Remove the declaration arrangement and kind mark
- [x] Complete Task 2: Move the cycle-count checkbox
- [x] Complete Task 3: Save the hierarchy
- [x] Changelog, format, lint, tsc, tests

## Notes

- Opened boxes and dragged box positions stay unsaved, by decision.
