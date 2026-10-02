---
name: Switch between level numbers and level paths, and side-middle anchoring next to the edge styles
issue: -
state: complete
version: -
---

## Goal

The reader chooses whether a level is labelled by its own number or by its path, and ticks "Start and end at the
middle of the side" right below the edge styles, where it is only selectable for the styles it applies to.

## Tasks

### 1. Level labels card
- A fourth card "Level labels" in the dependency bar with a pick-list: Number (default) or Path
- The choice is kept with the other dependency graph settings; band labels and box tooltips follow it

### 2. Side-middle anchoring below the edge styles
- The checkbox moves from the cog's settings to below the style list
- For Spread it is greyed out and shown unticked with a note; the tick stays saved and applies again for the other
  styles; Spread is always drawn spread

### 3. Verify
- Unit suite, type check, format check, dependency-cruiser, knip; screenshots; upward-dependency colors unchanged

## Steps

- [x] Complete Task 1: Level labels card
- [x] Complete Task 2: Side-middle anchoring below the edge styles
- [x] Complete Task 3: Verify

## Notes

- The edge style list and the level label list share one pick-list popover component
- Upward and cyclic edge colors compared on a build of HEAD and of this change with the `dependencies` edge metric:
  identical
