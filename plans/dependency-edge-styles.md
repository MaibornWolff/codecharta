---
name: Three edge styles in the dependency view
issue: none
state: complete
version: 2.9.0
---

## Goal

The dependency view offers three edge styles instead of four: Combined, Spread and Aside. Curved or straight
becomes a line shape of its own, and Aside bows downward edges out as well.

## Tasks

### 1. Model and routing
- `edgeStyle` is `combined | spread | aside`, the new `edgeShape` is `curved | straight`
- Combined: one spot per side for outgoing and one for incoming edges, optionally both at the middle
- Spread: every edge its own spot
- Aside: upward edges bow out on the right, downward edges on the left, always curved
- Straight draws a dependency that runs both ways as two arcs, as before

### 2. Bar
- The style popover lists the three styles, then a Curved | Straight row (Combined, Spread) and the
  middle checkbox (Combined only)
- Reset covers the line shape

### 3. Persistence
- v31 migration: `curved` → combined, `straight` → spread or, anchored at the middle, combined, both
  straight, `upwardAside` → aside

### 4. Changelog

## Steps

- [x] Complete Task 1: Model and routing
- [x] Complete Task 2: Bar
- [x] Complete Task 3: Persistence
- [x] Complete Task 4: Changelog
- [x] Checks: format, tests, lint, tsc

## Notes

- Decided with the user: up right and down left, Aside always curved, shape as a two-button row below the list
