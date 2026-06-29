---
name: On-map layout switcher (3D | Street | Mixed)
issue:
state: todo
version: 1
---

## Goal

Overlay a compact 3-way segmented switcher (3D | Street | Mixed) on the top-left of the map so users can change the layout algorithm at a glance, kept in two-way sync with the settings-panel layout selector. Story: `stories/map-layout-switcher.md` (#3).

## Decisions (agreed 2026-06-24)

- Placement: **top-left** overlay on the map.
- Mapping (1:1 to existing `LayoutAlgorithm` enum): **3D → SquarifiedTreeMap**, **Street → StreetMap**, **Mixed → TreeMapStreet**.
- Built the new-architecture way; depends on `stories/migrate-ui-feature-architecture.md` (#2) for `features/codeMap`.

## Background (audit 2026-06-24)

- Enum `LayoutAlgorithm` in `codeCharta.model.ts`: `SquarifiedTreeMap="Squarified TreeMap"`, `StreetMap="StreetMap"`, `TreeMapStreet="TreeMapStreet"`.
- State `appSettings.layoutAlgorithm`; action `setLayoutAlgorithm`; selector `layoutAlgorithmSelector` (in `globalSettings`); read/write via `MapLayoutService.layoutAlgorithm$()` / `setLayoutAlgorithm()` (wraps `MapLayoutStore`).
- `setLayoutAlgorithm` is already in `actionsRequiringRerender` → `RenderCodeMapEffect` re-renders automatically. **No new render wiring needed.**
- Settings-panel selector to stay in sync with: `globalSettings/.../mapLayoutSelection` (daisyUI `select`, same `MapLayoutService`).
- daisyUI 3-way precedent: `metricsBar/.../gradientModePicker` (`<div class="join" role="radiogroup">` + `join-item btn btn-sm` radios). Overlay precedent: `viewCubeToolbox` (`absolute top-0 left-1/2 ... shadow-md bg-base-100 rounded`, `z-11`).

## Tasks

### 1. Build the switcher component in `globalSettings`
- New `mapLayoutSwitcher` component (OnPush + signals), mirroring `gradientModePicker`: a daisyUI `join` radiogroup with three `join-item btn btn-sm` radios labeled `3D` / `Street` / `Mixed`.
- Read current via `toSignal(mapLayoutService.layoutAlgorithm$(), { requireSync: true })`; highlight the active option (`[checked]` / `btn-active`).
- On select, call `mapLayoutService.setLayoutAlgorithm(value)` using a label→enum map.
- Short labels in the buttons; full names via `aria-label`/`title` for clarity.
- Export the component from the `globalSettings` `facade.ts`.

### 2. Overlay it on the map (top-left)
- Render `<cc-map-layout-switcher>` in the `features/codeMap` overlay container (same place as `cc-view-cube`), absolutely positioned top-left: Tailwind `absolute top-0 left-0` + small margin, `z-11`, `shadow-md bg-base-100 rounded`.
- Keep it unobtrusive: only the control captures pointer events; it must not block map drag/zoom around it (small fixed-size element, like `viewCubeToolbox`).

### 3. Two-way sync
- Both the switcher and `mapLayoutSelection` read/write the same `MapLayoutService`/store, so sync is automatic. Add a test asserting a change in one is reflected in the other (shared selector).

### 4. Tests
- Component test: renders the 3 options, highlights the active one, dispatches `setLayoutAlgorithm` with the correct enum on click.
- Sync test (Task 3).
- e2e: switching on the map re-renders with the chosen layout and the settings-panel value matches.

## Steps

- [ ] Complete Task 1: `mapLayoutSwitcher` component + facade export
- [ ] Complete Task 2: top-left overlay on `features/codeMap`
- [ ] Complete Task 3: two-way sync (shared service/store)
- [ ] Complete Task 4: unit + sync + e2e tests

## Notes

- Re-render is free — `setLayoutAlgorithm` already triggers `RenderCodeMapEffect`.
- If #2 hasn't landed yet, the overlay can temporarily mount in `ui/codeMap` and move with the slice; prefer building after `features/codeMap` exists.
- `codeMap` importing a `globalSettings` component is allowed (facade/components are the public API per dep-cruiser).
