---
name: Remove Angular Material entirely
issue:
state: progress
version: 1
---

## Goal

Remove the last two Angular Material runtime usages from the visualization (the `colorPicker`
`mat-menu` and the `loadingFileProgressSpinner` `mat-progress-spinner`), tear down the
`app/material/` theme layer, and drop the `@angular/material` + `@angular/cdk` dependencies — so
the app contains zero Angular Material.

## Decisions (agreed 2026-06-17)

- Consolidate the old colorPicker family onto the existing Material-free `features/shared/components/inlineColorPicker` instead of rewriting it to daisyUI in place. This supersedes Task 2 of `2026-06-12-finish-feature-architecture-migration.md`.
- Keep the `mapColorLabel` pipe — it is still used by `legend/legendColorRow` and `metricsBar/colorBandRow` for read-only label display.
- This plan also completes Task 6 and part of Task 8 of the migration plan.

## Tasks

### 1. Consolidate the colorPicker family onto inlineColorPicker
- `edgeSettingsPopover.component.ts`: add the `mapColors` selector read and a `setMapColor(key, hex)` helper that dispatches `setMapColors({ value: { [key]: hex } })`. In the template, replace each `<cc-color-picker-for-map-color [mapColorFor]="…">` with a sibling label span (`Outgoing Edge` / `Incoming Edge`) + `<cc-inline-color-picker [hexColor]="…()" (colorChange)="setMapColor('outgoingEdge', $event)">`. The store read/dispatch moves up from the deleted wrapper; labels are static for edges so `mapColorLabel` is not needed here.
- `logoUpload.component.html`: replace `<cc-labelled-color-picker [hexColor]="logoColor()" [labels]="['Color']" (colorChange)="handleColorChange($event)">` with a `Color` label span + `<cc-inline-color-picker [hexColor]="logoColor()" (colorChange)="handleColorChange($event)">`. `handleColorChange` is unchanged (local signal, no store).
- Delete `ui/colorPicker`, `ui/labelledColorPicker`, `ui/colorPickerForMapColor` (+ specs) and `util/color/getReadableColorForBackground` + its `ReadableColorForBackgroundPipe` (+ specs) — `labelledColorPicker` is its only consumer.
- Removes the `@angular/material/menu` usage.

### 2. Replace the loading spinner with daisyUI
- `loadingFileProgressSpinner.component.html`: swap `<mat-progress-spinner mode="indeterminate" diameter="96">` for a daisyUI spinner, e.g. `<span class="loading loading-spinner h-24 w-24 text-primary"></span>`, keeping the `[style.visibility]` loading toggle.
- Drop the `MatProgressSpinner` import from the component; fold the `.scss` into Tailwind classes (it is trivial).
- Removes the `@angular/material/progress-spinner` usage — after this there is zero `mat-` DOM in the app.

### 3. Tear down the app/material/ theme layer
- Confirm zero `mat-` / `matX` / `cdk` references remain (`grep -rE "<mat-|matMenuTriggerFor|@angular/(material|cdk)" app`), then delete the entire `app/material/` folder (21 SCSS files — most are already-orphaned overrides for components removed in earlier migrations).
- Remove `@use "./material/material";` from `app/app.scss`.
- Remove `stylePreprocessorOptions.includePaths: ["app/material"]` from `angular.json`.
- Remove `provideAnimationsAsync()` and its import from `app/app.config.ts` — it exists only for Material (no other `@angular/animations` usage).

### 4. Drop dependencies and tighten rules
- Remove `@angular/material` and `@angular/cdk` from `package.json`; run `npm i` to refresh the lockfile.
- Clean up the 3 stale specs that still provide a dead `MatDialog`: `navBar/services/uploadFiles.service.spec.ts`, `sidebarExplorer/.../explorerSearchBar.component.spec.ts`, `state/effects/blacklistSearchPattern/blacklistSearchPattern.effect.spec.ts` (drop the import + provider).
- Tighten the dependency-cruiser no-Material rule to the whole app (migration plan Task 8).

### 5. Verify
- `npm test` (unit) and the affected specs; `npm run e2e` covering the edge color picker, logo color picker, and the loading spinner.
- Manual QA: edge settings popover color change persists and recolors edges; logo color recolors the 3D-print preview; loading spinner appears during file load.

## Steps

- [x] Complete Task 1: Consolidate the colorPicker family onto inlineColorPicker
- [x] Complete Task 2: Replace the loading spinner with daisyUI
- [x] Complete Task 3: Tear down the app/material/ theme layer
- [x] Complete Task 4: Drop dependencies and tighten rules
- [ ] Complete Task 5: Verify — unit + build + architecture green; e2e + manual QA still pending

## Notes

- Reachability verified (2026-06-17): the colorPicker family's only consumers are `edgeSettingsPopover` (×2, via `colorPickerForMapColor`) and `logoUpload` (via `labelledColorPicker`). No other references to `cc-color-picker` / `cc-labelled-color-picker` / `cc-color-picker-for-map-color`.
- `inlineColorPicker` needs NO additions: both consumers reduce to "swatch + static label + hex in/out, no alpha", and the label is rendered as a sibling in the parent template — exactly how the existing inline-picker consumers (`colorBandRow`, `folderOverrideRow`, `markFolderRow`) already work. It is also purpose-built to live inside a native `[popover]` (the edge settings shell), which is the case the old `mat-menu` handled badly.
- `getReadableColorForBackground` (+ pipe) is deletable — only `labelledColorPicker` used it. `mapColorLabel` must be KEPT.
- Only 2 Material runtime usages exist; all other `matX.scss` files style components already removed, so the `app/material/` deletion is mostly removing dead CSS.
- Order: Task 1 + Task 2 before Task 3 (Material DOM must be gone before deleting the theme/wiring); Task 3 before Task 4 (deps removed last).

## Verification performed (2026-06-17)

- `npm run build`: succeeds (compile + strict template typecheck + SCSS resolution). Only pre-existing daisyUI "empty sub-selector" CSS warnings.
- `npm run test`: 377 suites / 2227 passed (+6 todo), 45 snapshots passed, 0 failures.
- `npm run lint:architecture` (dependency-cruiser): 0 errors (80 pre-existing no-circular warnings unchanged); the broadened app-wide `no-angular-material` rule passes.
- `biome format`: changed files already clean.
- Final greps: zero `@angular/material`/`@angular/cdk` imports and zero `mat-`/`mat-menu`/`mat-progress` selectors remain anywhere in `app/`.
- Extra teardown beyond the original plan: removed a dead `@use "../../../../material/theme"` from `zoomSlider.component.scss` (unused) and the orphaned `.cdk-overlay-pane .cc-file-select` block from `app.scss`. Kept `@angular/animations` (separate dep; `provideAnimationsAsync` removed safely as nothing declares Angular animations). Kept the `#loading-gif-file` id + `[style.visibility]` toggle (awaited by e2e/po helpers).
- Still pending: `npm run e2e` (Playwright) and manual QA of the edge color pickers, logo color picker, and loading spinner.
