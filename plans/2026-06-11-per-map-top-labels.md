---
name: per-map-top-labels
issue: -
state: complete
version: 1
---

## Goal

When more than one map is selected (standard mode), a new "per map" radio option in the label
settings splits all node-selecting label computations per map: Top-N labels are picked per map
(N labels each), color-mode label selection runs per map, and overlapping-label grouping only
groups labels belonging to the same map. Default stays "across all maps" (current behavior).

## Tasks

### 1. New appSettings slice `labelsPerMap` (boolean, default false)
- actions/reducer/selector in `state/store/appSettings/labelsPerMap/`, mirroring `amountOfTopLabels`
- register in appSettings reducer, `AppSettings` model type, default state

### 2. Feature wiring in `features/labelSettings`
- `labelsPerMap.store.ts` + `labelsPerMap.service.ts` following existing store/service pattern
- export selector from `labelSettings.selectors.ts`
- add `appSettings.labelsPerMap` to `resetSettingsKeys` in the panel

### 3. UI radio in labelSettingsPanel
- radio group under the Top Labels slider: `(•) across all maps  ( ) per map`, styled like the
  existing Height/Color join radio
- only visible when 2+ maps are visible in standard mode (hidden for single map and delta mode):
  expose a `isMultipleMapsView$` via StateAccessStore based on visibleFileStates count + isDeltaState

### 4. Per-map top-N selection in `codeMap.render.service.ts` `setLabels`
- helper to derive a map key from `node.path` (top-level segment under root; AggregationGenerator
  prefixes paths with `/root/<fileName>/` when maps are merged)
- height mode: partition leaf nodes by map key, `selectTopNByValue` per partition (N each)
- color mode: same partitioning applied to the selected color nodes
- ignore the setting (keep global behavior) when only one map is visible or in delta mode

### 5. Per-map collision grouping in `labelCollision.service.ts`
- when per-map mode is active, `buildCollisionGroups` only unions overlapping labels that share
  the same map key

### 6. Tests
- reducer default/toggle
- render service: per-map vs global selection (height + color mode), single-map/delta fallback
- panel: radio visibility and dispatch
- collision service: overlapping labels from different maps are not grouped in per-map mode

### 7. Housekeeping
- CHANGELOG.md entry

## Steps

- [x] Complete Task 1: state slice `labelsPerMap`
- [x] Complete Task 2: feature store/service/selector wiring
- [x] Complete Task 3: UI radio with multi-map visibility
- [x] Complete Task 4: per-map top-N selection in render service
- [x] Complete Task 5: per-map collision grouping
- [x] Complete Task 6: tests
- [x] Complete Task 7: changelog

## Notes

- Clarified with user: one shared set of setting values; only node-selecting computations split
  per map ("N per map", so top 10 with 3 maps = up to 30 labels). No independent per-map settings.
- Option hidden (not just disabled) for single map and delta mode.
- Branch from `main`: `feature/per-map-top-labels`.
- New `labelsPerMapActiveSelector` (state/selectors) gates the behavior; the labelSettings feature
  reaches it via `StateAccessStore.isLabelsPerMapActive()` because `ui/` may not import feature
  internals (dependency-cruiser rules).
- `loadInitialFile.service.ts` needed the new key in `optionalAppSettingsKeys` plus a
  `mapAppSettingToAction` case — its switch throws on unknown saved-config keys.
- Scenarios intentionally left untouched: persisting the flag would break previously saved
  scenarios (undefined patch values) and was not requested.
- Verification: `tsc --noEmit` clean, full unit suite green (381 suites / 2222 tests),
  `npm run lint:architecture` 0 errors, Biome clean.
