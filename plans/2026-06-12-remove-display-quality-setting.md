---
name: remove-display-quality-setting
issue: -
state: complete
version: 1
---

## Goal

Remove the "Display Quality" setting (SharpnessMode) from the global configuration and hard-code the "Best" behavior (antialias + devicePixelRatio) in all cases. Delete everything only used by the other quality modes (FXAA, CustomComposer).

## Tasks

### 1. Hard-code "Best" rendering in the renderer
- `threeRenderer.service.ts`: remove `setGLOptions()` switch, always use antialias + `setPixelRatio(window.devicePixelRatio)`
- Remove `enableFXAA`/composer branches, `initComposer()`, and related imports
- Delete `customComposer.ts` + spec and `fxaaShaderStrings.ts`
- `codeMap.component.ts`: remove the restart-on-sharpness-change subscription

### 2. Remove the setting from UI and feature layer
- Delete `displayQualitySelection` component, remove its slot from `globalConfigurationDialog`
- Delete `DisplayQualityService`, `DisplayQualityStore` (+ specs)
- Remove `sharpnessMode$()` from facade and `sharpnessModeSelector` from selectors

### 3. Remove state slice and model type
- Delete `state/store/appSettings/sharpnessMode/` slice, unregister from appSettings actions/reducer
- Remove `SharpnessMode` enum and `sharpnessMode` field from `codeCharta.model.ts`
- `loadInitialFile.service.ts`: keep `sharpnessMode` case as ignored key (old saved settings must not throw)
- Remove `setSharpnessMode` from `actionsRequiringRerender.ts`

### 4. Update tests and changelog
- Update/replace specs, `dataMocks.ts`, resetSettings spec keys, snapshots
- Add CHANGELOG.md entry

## Steps

- [x] Complete Task 1: Hard-code "Best" rendering in the renderer
- [x] Complete Task 2: Remove the setting from UI and feature layer
- [x] Complete Task 3: Remove state slice and model type
- [x] Complete Task 4: Update tests and changelog

## Notes

- "Best" = `SharpnessMode.PixelRatioAA`: `antialias: true` + `setPixelRatio(window.devicePixelRatio)`, no FXAA
- Decision (user): hard-code Best even though the previous default was "High" (no pixel-ratio scaling)
- Decision (user): delete all code not part of the Best path (FXAA/CustomComposer)
- `ThreeViewerService.restart()` was only called on quality changes and was removed too
- No backward-compat case needed in `loadInitialFile.service.ts`: the saved-settings loop iterates over current appSettings keys, so a stale `sharpnessMode` key is ignored by construction
- Verified: full unit suite green (386 suites, 2209 tests), `tsc --noEmit` clean except a pre-existing unrelated error in colorBandRow.component.spec.ts, Biome formatting applied
