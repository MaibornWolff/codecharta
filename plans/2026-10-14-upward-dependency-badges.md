---
name: Upward dependency badges
issue: -
state: complete
version: -
---

## Goal

A closed box in the dependency view counts the upward dependencies it hides in a pill next to its cycle pills,
and the Labels card becomes a Badges card that switches each kind of mark on and off.

## Tasks

### 1. Levels by number only
- Drop the level label setting and its "Path" choice, and the level path code behind it
- Migrate persisted preferences

### 2. Badges card
- Replace `showsCycleBadges` with the shown box badges: cycles between files, cycles inside a file, declaration in a
  cycle, upward dependencies; all on by default, persisted, migrated from the old flag
- Card "Badges" with a popover like "Edges shown": selection shortcuts, one checkbox row per badge with its sample,
  reset button
- Legend lists only the shown badges

### 3. Upward pill
- Count per closed box the upward declaration dependencies whose both ends it hides (same upward rule as the edges)
- Pill after the cycle pills: up-arrow glyph and count in the upward edge colour, outline dashed while upward
  edges are drawn dashed
- Tooltip row and legend entry

### 4. Inspector "Upward" section
- Lists the upward dependencies inside the selected box like the other dependency rows
- A click on the upward pill selects the box and opens the section, like the cycle pill does for cycles

### 5. Changelog

## Steps

- [x] Complete Task 1: Levels by number only
- [x] Complete Task 2: Badges card
- [x] Complete Task 3: Upward pill
- [x] Complete Task 4: Inspector "Upward" section
- [x] Complete Task 5: Changelog

## Notes

- Decisions from Christian (2026-10-14): count hidden-inside only, every upward edge (also those closing a cycle),
  unit is declaration dependencies, the ring of a declaration in a cycle gets its own row
- The Badges card shows only for a map with declarations; the level labels by path were dropped with their code
- Verified: unit suite, type check, lint (depcruise, styles, knip) and Biome all pass
