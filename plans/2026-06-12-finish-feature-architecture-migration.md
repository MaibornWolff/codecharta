---
name: Finish feature-architecture migration
issue:
state: todo
version: 1
---

## Goal

Migrate the remaining `ui/` folders into the feature-slice architecture, fix wrongly allocated code, remove the last Angular Material and SCSS usages, and complete the zoneless flip.

## Decisions (agreed 2026-06-12)

- 3D engine (`ui/codeMap`) becomes `features/codeMap` with a facade.
- `ui/viewCube` (cube + zoomSlider) becomes its own `features/viewCube`; `features/viewCubeToolbox` stays separate and is composed via its facade (as today).
- Global ngrx state (`state/store`: appSettings, appStatus, dynamicSettings, fileSettings, files + effects + selectors) stays global.
- All shared pieces (errorDialog, loadingFileProgressSpinner, actionIcon, colorPicker, colorPickerForMapColor, labelledColorPicker, resetSettingsButton) move to `features/shared`.
- Zoneless: full flip in scope — OnPush + signals everywhere, then remove zone.js from `main.ts`.

## Tasks

### 1. Fix wrong allocations
- Move `ui/resetSettingsButton/getPartialDefaultState.ts` (pure store logic, imported by `globalSettings` and `labelSettings` feature stores) to `state/store/util/`
- Move `services/3DExports` into `features/3dPrint/services/` (only consumer is `export3DMapDialog`); resolve the no-circular warnings in `3DPreview` while moving

### 2. Migrate shared dumb components to features/shared
- `actionIcon`, `colorPicker`, `colorPickerForMapColor`, `labelledColorPicker`, `resetSettingsButton`, `loadingFileProgressSpinner`, `dialogs/errorDialog` → `features/shared/components`
- Rewrite Material usage (colorPicker, loadingFileProgressSpinner) to daisyUI, SCSS to Tailwind classes during the move
- **SUPERSEDED for the Material parts:** the `colorPicker` family is deleted (not moved/rewritten) and the spinner is rewritten by `plans/2026-06-17-remove-angular-material.md`, which also completes Task 6. `errorDialog` uses no Material; `fileExtensionBarSegment` (Task 3) has no Material left either — only the folder moves + SCSS→Tailwind remain here.

### 3. Migrate fileExtensionBar to a feature
- `ui/fileExtensionBar` → `features/fileExtensionBar` (components/selectors per feature layout)
- Replace Material in `fileExtensionBarSegment`, convert 3 SCSS files to Tailwind

### 4. Create features/codeMap (3D engine)
- Move `ui/codeMap` (rendering, threeViewer, render/tooltip/mouseEvent services) to `features/codeMap`
- Expose `codeMap.render.service`, `threeSceneService`, `threeRenderer.service`, `threeMapControls.service`, `threeCamera.service`, tooltip and mouseEvent services via `facade.ts`; update the 14+ feature importers to use the facade
- Convert `codeMap.component.scss` to Tailwind

### 5. Create features/viewCube
- Move `ui/viewCube` (cube component, meshGenerator, materials, mouseEvents service, zoomSlider) to `features/viewCube`
- Access map controls via the new codeMap facade; keep composing `viewCubeToolbox` via its facade
- Convert 2 SCSS files to Tailwind

### 6. Remove Angular Material remnants
- After tasks 2–3, delete `app/material/` theme SCSS files and drop `@angular/material` styles from the build (check `angular.json`/`app.scss` references)

### 7. Complete zoneless migration
- Add `ChangeDetectionStrategy.OnPush` to the 25 feature components missing it (audit list in `plans/2026-05-05-zoneless-features.md` is partially stale — re-audit)
- Replace `.subscribe()` with signals in `export3DMapButton` and `print3DButton`
- Bring migrated ex-`ui/` components to OnPush + signals
- Flip `main.ts` to `provideZonelessChangeDetection()` and remove the `zone.js` import as the final step; verify e2e

### 8. Update dependency-cruiser rules
- Extend the no-SCSS and no-Material rules to the whole app (or delete `ui/` exemption) once `ui/` is empty
- Raise `no-circular` from warn to error after Task 1 clears the 3DExports cycles

## Steps

- [ ] Complete Task 1: Fix wrong allocations
- [ ] Complete Task 2: Migrate shared dumb components to features/shared
- [ ] Complete Task 3: Migrate fileExtensionBar to a feature
- [ ] Complete Task 4: Create features/codeMap (3D engine)
- [ ] Complete Task 5: Create features/viewCube
- [ ] Complete Task 6: Remove Angular Material remnants
- [ ] Complete Task 7: Complete zoneless migration
- [ ] Complete Task 8: Update dependency-cruiser rules

## Notes

- Audit baseline (2026-06-12): dep-cruiser 0 errors / 80 warnings; 99 feature components, 74 with OnPush; Material in 3 non-spec files; all remaining SCSS confined to `ui/` and `app/material/`
- No cross-feature import violations exist inside `features/` — the facade rules are already enforced and passing
- `ui/viewCube` is not dead code: it is imported by `codeMap.component` (was invisible to a plain selector grep)
- Order matters: Task 4 (codeMap facade) before Task 5 (viewCube needs the facade); Tasks 2–3 before Task 6 (Material removal)
