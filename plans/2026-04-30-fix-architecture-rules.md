---
name: fix-architecture-rules
issue: ""
state: complete
version: 1.142.0
date: 2026-04-30
git_commit: b5fbb5f632b189c08dfe95b531dc5bda37a79837
branch: main
topic: "Fix dependency-cruiser rules and clean up the violations they catch"
tags: [plan, dependency-cruiser, architecture, ngrx, daisyui, features]
---

# Fix dependency-cruiser rules and clean up the violations they catch

## Goal

Two intertwined problems:

1. **The architecture rules are silently dead.** `.dependency-cruiser.js` sets `options.includeOnly: "^app/"`, which filters out every dependency edge to `node_modules/...` *before* the rule engine runs. As a result `features-no-angular-material` and `feature-only-stores-can-import-ngrx-store` never fire — even when violated. We discovered this by removing `includeOnly` and seeing dozens of unreported violations.
2. **Once those rules actually run, there are real architectural violations.** Newer features (`navBar`, `bottomBar`, `viewCubeToolbox`) inject `Store<CcState>` / `State<CcState>` directly into components and services instead of routing through a `stores/` subfolder; older features (`3dPrint`, `scenarios`) do the same. A few dialogs still use `@angular/material` widgets — most prominently `ConfirmResetMapDialogComponent` (full Material) and three buttons that open dialogs imperatively via `MatDialog`.

This plan tightens the config so the rules actually check, then fixes every violation they surface so the rules can be upgraded to `error` severity.

## Current State Analysis

- `.dependency-cruiser.js:121` — `options.includeOnly: "^app/"` is the cause of the silent rules. Confirmed empirically: removing it surfaces ~40 errors across rules 9 + 10.
- Rule 10 (`feature-only-stores-can-import-ngrx-store`) excludes only `stores/` from the rule. But `features/{globalSettings,labelSettings}/selectors/` already use `createSelector` from `@ngrx/store` — those would also fail. The widening must allow `selectors/` too.
- Rule 5 (`feature-labelSettings-no-external-access-to-services`) is fully redundant with rules 3 + 4 (proven during earlier audit). Should be removed.
- The canonical store pattern lives in `features/{globalSettings,labelSettings}/stores/*.store.ts`. Each store is `@Injectable({ providedIn: "root" })`, injects `Store<CcState>` (and optionally `State<CcState>` for synchronous reads), exposes `*$` observables and named action-dispatch methods. Services consume stores; components consume services or stores. See `features/labelSettings/stores/stateAccess.store.ts:11-32` for the broad-access example.
- `Export3DMapDialogComponent` (`features/3dPrint/components/export3DMapDialog/export3DMapDialog.component.ts:42-49`) and `GlobalConfigurationDialogComponent` already use the daisyUI `<dialog>` + `viewChild.required<ElementRef<HTMLDialogElement>>` + public `open()` pattern. The dialogs we need to migrate (`ErrorDialogComponent`, `ConfirmResetMapDialogComponent`) currently use `MatDialog`/`MAT_DIALOG_DATA` and need to be rewritten in this same pattern.

### Violation totals (after rule widening — selectors/ and *.spec.ts excluded)

`feature-only-stores-can-import-ngrx-store` — 17 production files:
- `3dPrint/components/{export3DMapButton,export3DMapDialog}/{*.component.ts}` (2)
- `bottomBar/components/hoveredPath/hoveredPath.component.ts` (1)
- `navBar/components/{deltaSelector,mapSelector,modeToggle,navBar,print3DButton}/*.component.ts` (5)
- `navBar/services/{uploadFiles,fileSelectionMode}.service.ts` (2)
- `scenarios/components/{saveScenarioDialog,scenarioListDialog}/*.component.ts` (2)
- `scenarios/services/{scenarioApplier,scenarios}.service.ts` (2)
- `viewCubeToolbox/components/{confirmResetMapDialog,presentationModeButton}/*.component.ts` (2)
- `viewCubeToolbox/services/screenshot.service.ts` (1)

`features-no-angular-material` — 4 production files:
- `viewCubeToolbox/components/confirmResetMapDialog/confirmResetMapDialog.component.ts` (full Material widgets)
- `viewCubeToolbox/components/resetMapButton/resetMapButton.component.ts` (`MatDialog` service)
- `navBar/components/print3DButton/print3DButton.component.ts` (`MatDialog` service)
- `3dPrint/components/export3DMapButton/export3DMapButton.component.ts` (`MatDialog` service)

## Desired End State

- `.dependency-cruiser.js` no longer hides npm edges from the rule engine.
- Every feature that touches `@ngrx/store` does so only from its own `stores/` (or `selectors/`) subfolder. Components and services within a feature consume stores via constructor injection.
- No `@angular/material` import anywhere under `features/`.
- `ErrorDialogComponent` and `ConfirmResetMapDialogComponent` use the daisyUI `<dialog>` + viewChild pattern; their callers open them via `dialog().open(...)` instead of `MatDialog.open(...)`.
- Rules 9 (`features-no-angular-material`) and 10 (`feature-only-stores-can-import-ngrx-store`) are at `severity: error`.
- `npm run lint:architecture` passes with 0 errors. (The 80 pre-existing `no-circular` warnings are not in scope.)

## What We're NOT Doing

- **Not** fixing the 80 pre-existing `no-circular` warnings (3D-print mesh chains + the `codeCharta.model ↔ files.ts ↔ codeCharta.api.model` triangle). Out of scope.
- **Not** moving the underlying `state/store/<slice>` directories (e.g. `state/store/appSettings/isPresentationMode/`) into feature folders. That's a separate "state colocation" plan we discussed earlier.
- **Not** rewriting any business logic. Stores are mechanical extractions of existing `Store.dispatch(...)` and `Store.select(...)` calls.
- **Not** redesigning UI of the migrated dialogs. `ErrorDialogComponent` and `ConfirmResetMapDialogComponent` keep their copy and visual layout; only the implementation switches from Material widgets to daisyUI `<dialog>` + Tailwind utility classes.
- **Not** changing any spec files just to remove `@ngrx/store` imports. Spec files are explicitly carved out from the rule.

## Architecture and Code Reuse

### Established store pattern (mirrored from `features/{globalSettings,labelSettings}/stores/`)

```
features/<X>/
  components/      ← inject services/stores via constructor; no @ngrx/store
  services/        ← inject stores; no @ngrx/store
  stores/          ← the only place that injects Store<CcState> / State<CcState>
  selectors/       ← thin createSelector() wrappers; @ngrx/store allowed for createSelector
  facade.ts        ← public API (re-exports stores/services that other features need)
```

```ts
// features/<X>/stores/<slice>.store.ts
@Injectable({ providedIn: "root" })
export class <Slice>Store {
  constructor(private readonly store: Store<CcState>) {}

  <slice>$ = this.store.select(<slice>Selector)

  set<Slice>(value: T) { this.store.dispatch(set<Slice>({ value })) }
}
```

### DaisyUI dialog pattern (mirrored from `Export3DMapDialogComponent`)

```ts
// foo.component.ts
@Component({...})
export class FooDialogComponent {
  dialog = viewChild.required<ElementRef<HTMLDialogElement>>("dialog")
  closed = output<void>()

  open(data: FooData) { /* set inputs, then... */ this.dialog().nativeElement.showModal() }
  close() { this.dialog().nativeElement.close() }
}
```

```html
<!-- foo.component.html -->
<dialog #dialog class="modal backdrop-blur-sm">
  <div class="modal-box">…</div>
  <form method="dialog" class="modal-backdrop"><button>close</button></form>
</dialog>
```

```html
<!-- caller -->
<button (click)="errorDialog().open({title, message})">…</button>
<cc-error-dialog #errorDialog />
```

## Files Affected

- `visualization/.dependency-cruiser.js` — rule rewriting (Phase 1).
- `app/codeCharta/features/navBar/{stores/**,components/**,services/**,facade.ts}` — Phase 2.
- `app/codeCharta/features/bottomBar/{stores/**,components/**,facade.ts}` — Phase 3.
- `app/codeCharta/features/viewCubeToolbox/{stores/**,components/**,services/**,facade.ts}` — Phase 4.
- `app/codeCharta/features/3dPrint/{stores/**,components/**,facade.ts}` — Phase 5.
- `app/codeCharta/features/scenarios/{stores/**,components/**,services/**,facade.ts}` — Phase 5.
- `app/codeCharta/ui/dialogs/errorDialog/errorDialog.component.{ts,html,spec.ts}` — Phase 6.
- `app/codeCharta/features/viewCubeToolbox/components/confirmResetMapDialog/confirmResetMapDialog.component.{ts,html,spec.ts}` — Phase 6.

## Migration Notes

- Each phase is independently mergeable. Rules 9 + 10 stay at `severity: warn` from Phase 1 onward; only Phase 6 flips them to `error`.
- Spec files (`*.spec.ts`) are explicitly excluded from rules 9 + 10 — they may freely import `@ngrx/store/testing` (`provideMockStore`) and mock `MatDialog` for setup.
- Cross-feature store consumption (e.g. navBar's `print3DButton` needing the 3dPrint feature's color-mode logic) goes through `features/<X>/facade.ts`, not via direct path imports — required by rule 4.

---

## Phase 1: Tighten the dep-cruiser config

Foundational. After this phase the rules actually run; existing violations now appear as `warn` in `npm run lint:architecture`.

### Tasks

- [x] In `.dependency-cruiser.js`, replace `options.includeOnly: "^app/"` with `options.exclude: { path: "(^|/)node_modules/(?!@(ngrx|angular)/)" }`. (Or simpler: drop `includeOnly` entirely and add `options.exclude.path` patterns for `dist/`, `build/`, `.scannerwork/`. The point is npm edges to `@ngrx/*` and `@angular/*` must reach the rule engine.)

- [x] Widen rule 10 (`feature-only-stores-can-import-ngrx-store`) `from.pathNot` array:
  ```js
  pathNot: [
      "^app/codeCharta/features/[^/]+/(stores|selectors)/",
      "\\.spec\\.ts$"
  ]
  ```

- [x] Add spec carve-out to rule 9 (`features-no-angular-material`) `from.pathNot: "\\.spec\\.ts$"`.

- [x] Lower rules 9 + 10 to `severity: "warn"` for the duration of phases 2-5. (Phase 6 flips them back to `error`.)

- [x] Delete rule 5 (`feature-labelSettings-no-external-access-to-services`) — fully redundant with rules 3 + 4.

### Automated Verification

- [x] `npm run lint:architecture` runs and reports the new violations as warnings (no error exit code).
- [x] Removing `includeOnly` doesn't introduce regressions: check the warning count for rules 1-8 doesn't change vs. baseline (80 pre-existing `no-circular` warnings).
- [x] `npm run build` still succeeds (no functional code change in this phase).

---

## Phase 2: navBar — stores layer

Largest phase. 5 components + 2 services migrated.

### Tasks

- [x] Create `app/codeCharta/features/navBar/stores/` with:
  - `filesSelection.store.ts` — exposes `files$`, `referenceFile$`, `comparisonFile$`, `isDeltaState$`; methods `setStandard(files)`, `removeFiles(names)`, `setDelta({reference, comparison})`, `setDeltaReference(file)`, `setDeltaComparison(file)`, `switchReferenceAndComparison()`, `setFiles(states)`, `getCurrentFiles(): FileState[]` (uses `State.getValue()`).
  - `loadingState.store.ts` — methods `setLoadingFile(value)`, `setLoadingMap(value)`.

- [x] Create `app/codeCharta/features/navBar/selectors/` with `navBar.selectors.ts` — re-exports the relevant existing global selectors (`filesSelector`, `isDeltaStateSelector`, `referenceFileSelector`) plus any thin local `createSelector` wrappers needed.

- [x] Refactor `services/uploadFiles.service.ts`: drop `Store` injection; inject `LoadingStateStore` instead of dispatching `setIsLoadingFile`/`setIsLoadingMap` directly.

- [x] Refactor `services/fileSelectionMode.service.ts`: drop `Store` and `State` injections; inject `FilesSelectionStore`. The `pairwise()` subscription stays — but instead of `this.store.select(filesSelector)` use `this.filesSelectionStore.files$`. State reads use `getCurrentFiles()`.

- [x] Refactor `components/mapSelector/mapSelector.component.ts`: replace `inject(Store)` with `inject(FilesSelectionStore)`; `toSignal(this.store.select(filesSelector))` → `toSignal(this.filesSelectionStore.files$)`; `dispatch(setStandard(...))` → `filesSelectionStore.setStandard(...)`; same for `removeFiles`.

- [x] Refactor `components/deltaSelector/deltaSelector.component.ts`: replace `Store` injection with `FilesSelectionStore`; map `referenceFile$`, `comparisonFile$`, `setDeltaReference`, `setDeltaComparison`, `switchReferenceAndComparison` accordingly.

- [x] Refactor `components/modeToggle/modeToggle.component.ts`: replace `Store` injection with `FilesSelectionStore`; `toSignal(this.store.select(isDeltaStateSelector))` → `toSignal(this.filesSelectionStore.isDeltaState$)`.

- [x] Refactor `components/navBar/navBar.component.ts`: same — `FilesSelectionStore.isDeltaState$`.

- [x] Refactor `components/print3DButton/print3DButton.component.ts`: drop `Store` and `State` injections. The component currently dispatches `setColorMode` and reads `colorModeSelector`/`State.getValue().dynamicSettings.colorMode`. Phase 5 introduces `features/3dPrint/stores/colorMode.store.ts`; this component will inject that via the 3dPrint facade in Phase 5. **Mark with a `// TODO(phase-5): inject ColorModeStore from 3dPrint facade` comment for now**, leaving the existing logic temporarily in place.

- [x] Re-export the new stores via `features/navBar/facade.ts` (only those needed by external code; for now the existing `UploadFilesService` re-export stays, no new external consumers).

### Automated Verification

- [x] All existing navBar specs pass: `npx jest --config conf/jestUnit.config.json features/navBar`.
- [x] `npm run build` succeeds.
- [x] `npm run format:check` passes.
- [x] `npm run lint:architecture` shows fewer rule-10 warnings than at the start of the phase (specifically: 7 fewer — the 5 components + 2 services).

---

## Phase 3: bottomBar — stores layer

Smallest phase. One component to migrate.

### Tasks

- [x] Create `app/codeCharta/features/bottomBar/stores/hoveredPath.store.ts` exposing `hoveredPathData$ = this.store.select(hoveredNodePathPanelDataSelector)`.

- [x] Refactor `components/hoveredPath/hoveredPath.component.ts`: replace `inject(Store)` + `toSignal(store.select(...))` with `inject(HoveredPathStore)` + `toSignal(this.hoveredPathStore.hoveredPathData$)`. The selector itself stays in `features/bottomBar/selectors/` (no change).

### Automated Verification

- [x] `npx jest --config conf/jestUnit.config.json features/bottomBar` passes.
- [x] `npm run build` succeeds.
- [x] `npm run format:check` passes.
- [x] Rule-10 warning count down by 1.

---

## Phase 4: viewCubeToolbox — stores layer

3 production files + a new broad-access store.

### Tasks

- [x] Create `app/codeCharta/features/viewCubeToolbox/stores/`:
  - `presentationMode.store.ts` — `presentationMode$`; `setPresentationMode(value)`.
  - `mapReset.store.ts` — `metricData$`; methods `resetState()`, `setDefaultMetrics(nodeMetricData)` (i.e. dispatching `setState({ value: defaultState })` and the metric-reset action sequence currently inlined in `confirmResetMapDialog.component.ts:35-65`).
  - `stateAccess.store.ts` — exposes `getFiles(): FileState[]` (used by `screenshot.service.ts` for read-only file listing). Mirrors `features/labelSettings/stores/stateAccess.store.ts`.

- [x] Refactor `components/presentationModeButton/presentationModeButton.component.ts`: replace `inject(Store)` with `inject(PresentationModeStore)`; signal/dispatch wiring updated.

- [x] Refactor `components/confirmResetMapDialog/confirmResetMapDialog.component.ts` — drop `Store` injection; move all NgRx interaction into `MapResetStore`. The component keeps `LoadFileService`, `LoadInitialFileService`, `HttpClient`, `UrlExtractor` (those aren't @ngrx/store). Material widgets are NOT touched in this phase — Phase 6 handles them.

- [x] Refactor `services/screenshot.service.ts` — replace `inject(State<CcState>)` with `inject(StateAccessStore)`; `state.getValue().files` → `stateAccessStore.getFiles()`.

### Automated Verification

- [x] `npx jest --config conf/jestUnit.config.json features/viewCubeToolbox` passes.
- [x] `npm run build` succeeds.
- [x] `npm run format:check` passes.
- [x] Rule-10 warning count down by 3.

---

## Phase 5: 3dPrint + scenarios — stores layer

These two older features have similar shapes. Bundled because their migrations are independent of each other and don't touch newer features.

### Tasks

- [x] Create `app/codeCharta/features/3dPrint/stores/`:
  - `colorMode.store.ts` — `colorMode$`; `setAbsoluteColorMode()` (sugar around `setColorMode({ value: ColorMode.absolute })`).
  - `printDialog.store.ts` (or extend an existing one) — for state used by `Export3DMapDialogComponent`'s constructor reads (`State.getValue().dynamicSettings.{areaMetric,heightMetric,colorMetric}`, `fileSettings.{attributeDescriptors,blacklist}`, etc.). Bundled into a single `stateAccess.store.ts` is fine.

- [x] Refactor `features/3dPrint/components/export3DMapButton/export3DMapButton.component.ts`: drop `Store`/`State`; inject the new stores.

- [x] Refactor `features/3dPrint/components/export3DMapDialog/export3DMapDialog.component.ts`: drop `State`; inject `StateAccessStore` to read all those constructor-time values.

- [x] Re-export `ColorModeStore` from `features/3dPrint/facade.ts`.

- [x] Update `features/navBar/components/print3DButton/print3DButton.component.ts` (the TODO from Phase 2): inject `ColorModeStore` from the 3dPrint facade; remove its `Store`/`State` injections.

- [x] Create `app/codeCharta/features/scenarios/stores/`:
  - `scenarios.store.ts` — covers the dispatch/select calls in `services/scenarios.service.ts`.
  - `scenarioApplier.store.ts` — covers `services/scenarioApplier.service.ts`.
  - `scenarioDialog.store.ts` — covers the two dialog components.

- [x] Refactor `features/scenarios/services/{scenarios,scenarioApplier}.service.ts`: drop `Store`; inject the new stores.

- [x] Refactor `features/scenarios/components/{saveScenarioDialog,scenarioListDialog}/*.component.ts`: drop `Store`; inject the new stores.

### Automated Verification

- [x] `npx jest --config conf/jestUnit.config.json features/3dPrint features/scenarios features/navBar` passes (note: navBar regression check because of the `print3DButton` TODO resolution).
- [x] `npm run build` succeeds.
- [x] `npm run format:check` passes.
- [x] Rule-10 warning count down by 7 (5 in scenarios + 2 in 3dPrint, plus 1 in navBar's print3DButton resolved).
- [x] Rule-10 warning count is now **0**.

---

## Phase 6: Banish Material from features

Rewrite the two remaining Material dialogs in DaisyUI; refactor their callers to use the viewChild pattern; flip rule severities to `error`.

### Tasks

- [x] Rewrite `app/codeCharta/ui/dialogs/errorDialog/errorDialog.component.{ts,html}`:
  - Drop `MatDialogTitle`, `MatDialogContent`, `MatDialogActions`, `MatDialogClose`, `MatButton`, `CdkScrollable` imports.
  - Replace `@Inject(MAT_DIALOG_DATA) public data: ...` with `data = signal<ErrorDialogData | null>(null)` plus a public `open(data: ErrorDialogData)` method that sets the signal and calls `dialog().nativeElement.showModal()`.
  - `dialog = viewChild.required<ElementRef<HTMLDialogElement>>("dialog")`.
  - Template uses `<dialog #dialog class="modal backdrop-blur-sm">` with daisyUI `modal-box`, `btn`, `btn-primary` classes.
  - The "Change and continue" resolve button still wired through `data.resolveErrorData.onResolveErrorClick()`.

- [x] Update `errorDialog.component.spec.ts` to use the new `open(data)` API rather than `MAT_DIALOG_DATA` injection. (No existing spec; consumers tested via their own specs.)

- [x] Rewrite `app/codeCharta/features/viewCubeToolbox/components/confirmResetMapDialog/confirmResetMapDialog.component.{ts,html}`:
  - Drop `MatToolbar`, `MatDialogContent`, `MatDialogActions`, `MatButton`, `MatDialogClose`, `CdkScrollable` imports.
  - Convert template to `<dialog #dialog class="modal">` + daisyUI `modal-box` with the same copy ("Confirm reset map to default" header, body, "No"/"Yes" buttons).
  - Add public `open()` method using the established viewChild pattern. `Yes` button calls `mapResetStore.resetState()` (introduced in Phase 4), then closes; `No` just closes.

- [x] Update `confirmResetMapDialog.spec.ts` to use the new `open()` API.

- [x] Refactor `features/viewCubeToolbox/components/resetMapButton/resetMapButton.component.ts`:
  - Drop `MatDialog` injection.
  - Add `confirmDialog = viewChild.required<ConfirmResetMapDialogComponent>("confirmDialog")` and `imports: [..., ConfirmResetMapDialogComponent]`.
  - Click handler: `this.confirmDialog().open()`.
  - Template: `<cc-confirm-reset-map-dialog #confirmDialog />` next to the button.

- [x] Refactor `features/navBar/components/print3DButton/print3DButton.component.ts`:
  - Drop `MatDialog` injection.
  - Add `errorDialog = viewChild.required<ErrorDialogComponent>("errorDialog")` and `imports: [..., ErrorDialogComponent]`.
  - Replace `dialog.open(ErrorDialogComponent, { data: this.buildErrorDialog() })` with `this.errorDialog().open(this.buildErrorDialog())`.
  - Template: `<cc-error-dialog #errorDialog />`.

- [x] Refactor `features/3dPrint/components/export3DMapButton/export3DMapButton.component.ts`: same pattern as `print3DButton` — remove `MatDialog`, add `<cc-error-dialog #errorDialog />` and viewChild.

- [x] Update `resetMapButton.component.spec.ts`, `print3DButton.component.spec.ts`, `export3DMapButton.component.spec.ts`: replace `MatDialog` mocks with `viewChild` stubs (assert `dialog().open` was called).

- [x] In `.dependency-cruiser.js`, flip rules 9 (`features-no-angular-material`) and 10 (`feature-only-stores-can-import-ngrx-store`) back to `severity: "error"`.

### Automated Verification

- [x] `npm run build` succeeds.
- [x] `npm test` passes (full suite).
- [x] `npm run format:check` passes.
- [x] `npm run lint:architecture` passes with **0 errors** for rules 9 and 10. (Pre-existing 80 `no-circular` warnings still present — out of scope.)
- [x] grep verification: `grep -r "@angular/material" app/codeCharta/features --include="*.ts" | grep -v "\\.spec\\.ts"` returns no results.
- [x] grep verification: `grep -r "@ngrx/store" app/codeCharta/features --include="*.ts" | grep -v "\\.spec\\.ts" | grep -vE "/(stores|selectors)/"` returns no results.

### Manual Verification

- [x] Open the app at `http://localhost:4200`.
- [x] Click the toolbox **refresh** button → confirm-reset dialog appears with the same copy ("Confirm reset map to default", "Yes"/"No"). Click **Yes** → map resets. Click **No** → dialog closes, map unchanged.
- [x] With color mode set to a non-absolute setting, click the **3D Print** button (navbar) → error dialog appears. Click "Change and continue" → color mode switches and the 3D Print preview opens.
- [x] Same scenario via the older `Export 3D Map` button (if still rendered anywhere) — error dialog matches.
- [x] No Material CDK overlay backdrops appear; the dialogs use the native `<dialog>` modal backdrop.
- [x] No new console errors or unexpected styling glitches in any dialog.

---

## Steps

- [x] Complete Phase 1: Tighten the dep-cruiser config
- [x] Complete Phase 2: navBar — stores layer
- [x] Complete Phase 3: bottomBar — stores layer
- [x] Complete Phase 4: viewCubeToolbox — stores layer
- [x] Complete Phase 5: 3dPrint + scenarios — stores layer
- [x] Complete Phase 6: Banish Material from features

## References

- Dead-rule diagnosis: `.dependency-cruiser.js:121` (`includeOnly: "^app/"` filters npm edges before rules run)
- Canonical store pattern: `app/codeCharta/features/labelSettings/stores/stateAccess.store.ts:11-32`
- Smaller store example: `app/codeCharta/features/globalSettings/stores/screenshotDestination.store.ts`
- DaisyUI `<dialog>` pattern: `app/codeCharta/features/3dPrint/components/export3DMapDialog/export3DMapDialog.component.ts:42-49,116-125`
- Existing facade/services consumption: `app/codeCharta/features/globalSettings/services/screenshotDestination.service.ts`
