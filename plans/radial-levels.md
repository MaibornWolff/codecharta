---
name: Selectable number of levels for the radial layouts
issue: none
state: progress
version: 1
---

## Goal

Let the user pick how many folder levels the Sunburst and the Radial TreeMap show around the centre (1–10,
default 3) with a slider in the layout picker, as TreeMapStreet does for its file limit.

## Tasks

### 1. Preference
- New `radialLevels` preference (action, reducer, selector, read window, write facade), saved like the others
- Restore it from a saved state and seed it into existing IndexedDB records with a v25 migration

### 2. Layouts take the level count
- Sunburst rings and Radial TreeMap bands come from the given level count instead of the fixed 3
- The shapes become factories of the level count; the radial map builds them from the preference

### 3. Slider
- "Visible levels" slider (1–10) in the layout popover while Sunburst or Radial TreeMap is picked

## Steps

- [x] Complete Task 1: Preference
- [x] Complete Task 2: Layouts take the level count
- [x] Complete Task 3: Slider
- [x] Changelog entry
- [ ] Unit tests, lint and e2e green (could not run in the agent environment)

## Notes

- One shared setting for both radial layouts (decided with the user)
- Persisted preference; IndexedDB v25 seeds it into older records
- Radial TreeMap still reaches one level deeper than its bands (last band shows folder contents as cells)
