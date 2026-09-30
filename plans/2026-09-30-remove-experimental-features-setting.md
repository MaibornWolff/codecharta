---
name: Remove experimental features setting
issue: -
state: complete
version: -
---

## Goal

Remove the "Enable Experimental Features" setting and the two features it still gates (zero-area buildings, raised
floor labels), keeping the default behaviour.

## Tasks

### 1. Drop the gated code paths
- `calculateAreaValue` / `getSquarifiedTreeMap`: always 0 for nodes without an area value
- `sortVisibleNodesByHeightDescending`: drop the min-building-length branch
- `FloorLabelDrawer`: fixed folder height, no experimental constructor parameter

### 2. Remove the setting
- Global settings dialog checkbox, write store, facade
- Preferences store slice (actions, reducer, selector, read window, facades), state model, mocks
- IndexedDB persisted key and initial-state/URL parameter; old saved states carrying the key must still load

### 3. Tests and changelog
- Update specs, add a Removed entry to the changelog

## Steps

- [x] Complete Task 1: Drop the gated code paths
- [x] Complete Task 2: Remove the setting
- [x] Complete Task 3: Tests and changelog
- [x] Run format check, tests, lint, type check

## Notes

- Both features date from Oct 2024 (#3789, #3137) and are not needed anymore.
