---
name: Floating Label Size Slider
issue: -
state: todo
version: 1
date: 2026-05-04
git_commit: 836c9ccb1f1c05083add09c98525c0b5afd4f66a
branch: worktree-bigger-labels
---

## Goal

Add a "Label Size" slider in the labels modal that scales the floating CSS2D labels (name + metric value) by a single multiplier (0.75×–2.5×, default 1.0×) so screenshots remain legible. The setting persists in scenarios. Floor labels are out of scope.

## Current State

- Floating labels are HTML built in `LabelElement` (`visualization/app/codeCharta/features/labelSettings/services/labelElement.ts:74-93`) with hardcoded `font-size: 12px` (name) and `10px` (metric / "+N more" badge).
- The labels modal lives in `LabelSettingsPanelComponent` (`features/labelSettings/components/labelSettingsPanel/`) and already follows a slider pattern for "Top Labels" we can mirror.
- Label collisions use live `getBoundingClientRect()` in `labelCollision.service.ts`, so larger fonts auto-grow the rects with no constant changes needed.
- Floor labels (`floorLabelDrawer.ts`) compute their own font from map width — we will not touch them.

## Desired End State

Opening the labels modal shows a new "Label Size" slider directly under "Top Labels". Dragging it immediately rescales both the name text and metric text of all visible floating labels (and the "+N more" badge) proportionally, without re-creating labels. The selected value is saved with scenarios under the existing `labelsAndFolders` section, restored on reload, and reset by the "Reset label settings" button.

## What We're NOT Doing

- Not changing floor labels.
- Not introducing per-line size controls (single multiplier only).
- Not changing collision/connector constants (rects are live-measured).
- Not adding a separate "label box padding" / "background opacity" control.

## UI Mockup

```
┌─ Labels ───────────────────┐
│ Top Labels                 │
│ [▬▬▬○─────] [10]           │
│                            │
│ Label Size            NEW  │
│ [▬▬▬○─────] [1.0×]         │
│                            │
│ [Height][ Color ]          │
│ ☐ Show node names          │
│ ☐ Show metric values       │
│ ☐ Group overlapping labels │
│ [ Reset label settings ]   │
└────────────────────────────┘
```

Slider: range `0.75–2.5`, step `0.25`, numeric input shows `× 1.0`, debounced (matches Top Labels pattern).

## Architecture and Code Reuse

Add the new state slice exactly the way `amountOfTopLabels` is wired up (action / reducer / selector / service / store / panel binding). Implement the visual scaling by writing `font-size` styles into `LabelElement` based on a base size multiplied by `labelSize`. The `name` span and `metric/badge` span keep their proportional ratio (12 : 10).

Affected files:

- `visualization/app/codeCharta/state/store/appSettings/labelSize/` *(new)*
  - `labelSize.actions.ts` — `setLabelSize` action mirroring `setAmountOfTopLabels`
  - `labelSize.reducer.ts` — `defaultLabelSize = 1`, `labelSize` reducer
  - `labelSize.selector.ts` — `labelSizeSelector`
  - `labelSize.reducer.spec.ts` — reducer test
- `visualization/app/codeCharta/state/store/appSettings/`
  - `appSettings.reducer.ts` — register reducer + default
  - `appSettings.actions.ts` — append `setLabelSize` to action union
- `visualization/app/codeCharta/codeCharta.model.ts` — add `labelSize: number` to `AppSettings`
- `visualization/app/codeCharta/features/labelSettings/`
  - `selectors/labelSettings.selectors.ts` — re-export `labelSizeSelector`
  - `stores/labelSize.store.ts` *(new)* — mirror `amountOfTopLabels.store.ts`
  - `services/labelSize.service.ts` *(new)* — mirror `amountOfTopLabels.service.ts`
  - `services/label.constants.ts` — add `MIN_LABEL_SIZE = 0.75`, `MAX_LABEL_SIZE = 2.5`, `LABEL_SIZE_STEP = 0.25`, `BASE_NAME_FONT_PX = 12`, `BASE_METRIC_FONT_PX = 10`, `BASE_BADGE_FONT_PX = 10`
  - `services/labelElement.ts` — accept `labelSize` and apply scaled font sizes on `this.content` (name span inherits) and overridden metric span / badge
  - `services/labelCreation.service.ts` — read `appSettings.labelSize` (already destructured from `stateAccessStore.getValue()`) and pass into `new LabelElement(...)`
  - `stores/labelSize.store.ts` *(new)* + `stores/labelSize.store.spec.ts` *(new)*
  - `components/labelSettingsPanel/labelSettingsPanel.component.html` — new slider markup under Top Labels
  - `components/labelSettingsPanel/labelSettingsPanel.component.ts` — bind signal + debounced setter; add `appSettings.labelSize` to `resetSettingsKeys`
  - `components/labelSettingsPanel/labelSettingsPanel.component.spec.ts` — slider tests
  - `facade.ts` — expose `labelSize$()` / `setLabelSize()`
- `visualization/app/codeCharta/state/effects/renderCodeMapEffect/actionsRequiringRerender.ts` — add `setLabelSize` (re-render rebuilds labels with new sizes)
- `visualization/app/codeCharta/services/loadInitialFile/loadInitialFile.service.ts` — add `case "labelSize"` in `mapAppSettingToAction` switch
- `visualization/app/codeCharta/features/scenarios/`
  - `model/scenario.model.ts` — add `labelSize: number` to `LabelsAndFoldersSection`
  - `services/scenarioApplier.service.ts` — propagate in `buildLabelsAndFoldersPatch`
  - `services/scenarios.service.ts` — capture in `getLabelsAndFoldersSection`
  - `stores/scenarioIndexedDB.spec.ts`, `components/applyScenarioDialog/applyScenarioDialog.component.spec.ts`, `components/scenarioListDialog/scenarioListDialog.component.spec.ts`, `services/scenarios.service.spec.ts`, `services/scenarioApplier.service.spec.ts` — extend test fixtures
- `visualization/app/codeCharta/util/dataMocks.ts` — add `labelSize: 1` to the two `appSettings` mocks
- `visualization/app/codeCharta/util/settingsHelper.spec.ts` — extend `appSettings` fixtures (lines 30, 38) with `labelSize: 1`
- `visualization/app/codeCharta/ui/resetSettingsButton/getPartialDefaultState.spec.ts` — add a test that resetting `appSettings.labelSize` returns the static default `1`

Files intentionally NOT touched (verified):
- `features/labelSettings/stores/stateAccess.store.ts` — its special-case for `amountOfTopLabels` overwrites the dynamic reset value with the static default. `labelSize` has no dynamic reset path (`getPartialDefaultState` already returns the static default), so no override needed here.
- `ui/codeMap/codeMap.render.service.ts` — uses `amountOfTopLabels` for top-N slicing; `labelSize` is read by `LabelElement` directly via `LabelCreationService`, no render-service plumbing required.

## Performance Considerations

- Setting is applied at label creation; changing the slider triggers `setLabelSize` which is part of `actionsRequiringRerender` → existing render pipeline rebuilds labels (same path as Top Labels). Live-rect collision detection adapts automatically. Debounced input (400 ms, matching `amountOfTopLabels`) prevents thrashing.

## Migration Notes

- `labelSize` defaults to `1` for any scenario / state read prior to this change. Reducer default plus the initial-load switch case handle missing values by simply not dispatching, falling back to default state. No data migration required.

---

## Phase 1: State plumbing

Add the new state slice and wire it through model, reducer, actions, selector, store, service, facade, rerender effect, initial-load service, scenario applier/service, scenario model, and dataMocks.

**Tasks**:
- [x] Create `state/store/appSettings/labelSize/labelSize.actions.ts` with `setLabelSize`.
- [x] Create `state/store/appSettings/labelSize/labelSize.reducer.ts` with `defaultLabelSize = 1` and `labelSize` reducer using `setState` factory.
- [x] Create `state/store/appSettings/labelSize/labelSize.selector.ts` with `labelSizeSelector`.
- [x] Register `labelSize` in `appSettings.reducer.ts` (combiner + `defaultAppSettings`).
- [x] Add `setLabelSize` to `appSettings.actions.ts` `appSettingsActions[]`.
- [x] Add `labelSize: number` to `AppSettings` interface in `codeCharta.model.ts`.
- [x] Re-export `labelSizeSelector` from `features/labelSettings/selectors/labelSettings.selectors.ts`.
- [x] Add `LabelSizeStore` mirroring `AmountOfTopLabelsStore`.
- [x] Add `LabelSizeService` mirroring `AmountOfTopLabelsService`.
- [x] Extend `LabelSettingsFacade` with `labelSize$()` / `setLabelSize()`.
- [x] Add `setLabelSize` to `actionsRequiringRerender`.
- [x] Add `case "labelSize"` to `loadInitialFile.service.ts:mapAppSettingToAction` (also added to `optionalAppSettingsKeys` so missing-from-saved-state does not warn).
- [x] Extend `LabelsAndFoldersSection` in `scenario.model.ts` with `labelSize: number`.
- [x] Update `scenarios.service.ts:getLabelsAndFoldersSection` to capture `appSettings.labelSize`.
- [x] Update `scenarioApplier.service.ts:buildLabelsAndFoldersPatch` to propagate `labelSize`.
- [x] Add `labelSize: 1` to both `appSettings` mocks in `util/dataMocks.ts` (also fixed pre-existing missing `groupLabelCollisions: false`).
- [x] Add `labelSize: 1` to the two `appSettings` fixtures in `util/settingsHelper.spec.ts`.
- [x] Add `labelSize.store.spec.ts` mirroring `amountOfTopLabels.store.spec.ts`.
- [x] Add a test in `getPartialDefaultState.spec.ts` covering `appSettings.labelSize` reset to `1`.
- [x] Update existing scenario test fixtures so their `labelsAndFolders` objects include `labelSize` (also added pre-existing missing `labelMode`/`groupLabelCollisions`).

**Automated Verification**:
- [x] `labelSize.reducer.spec.ts` passes (new file: asserts `setLabelSize` updates state, default is `1`).
- [x] `npm test` passes (350 suites, 2014 tests; no regressions in scenario/applier/loadInitialFile suites).
- [x] `npm run build` succeeds (`AppSettings` exhaustive switches still compile).
- [x] `npm run format:check` passes.

---

## Phase 2: Apply size to floating labels

Make `LabelElement` use the multiplier and ensure it is read from state at creation time.

**Tasks**:
- [x] Add `MIN_LABEL_SIZE = 0.75`, `MAX_LABEL_SIZE = 2.5`, `LABEL_SIZE_STEP = 0.25`, `BASE_NAME_FONT_PX = 12`, `BASE_METRIC_FONT_PX = 10`, `BASE_BADGE_FONT_PX = 10` to `label.constants.ts`.
- [x] Change `LabelElement` constructor to accept `labelSize: number`. `buildContentStyles()` sets `font-size: ${BASE_NAME_FONT_PX * labelSize}px` on `this.content`. Metric span and badge use scaled `${BASE_METRIC_FONT_PX * labelSize}px` / `${BASE_BADGE_FONT_PX * labelSize}px`.
- [x] Update `LabelCreationService.addLeafLabel` to destructure `labelSize` from `appSettings` and pass it into `new LabelElement(nameText, metricText, labelSize)`.
- [x] Extend `labelCreation.service.spec.ts` to cover the multiplier (label at 2× has `font-size: 24px` on content; metric span has `font-size: 20px`) plus a default-size baseline.

**Automated Verification**:
- [x] `labelCreation.service.spec.ts` passes (new test: creates a label at 2× and asserts inline `font-size` reflects `24px` on name and `20px` on metric span).
- [x] `labelCollision.service.spec.ts` and existing label-related suites pass (5 suites, 43 tests).
- [x] `npm test` passes overall.

---

## Phase 3: Slider UI in labels modal

Wire the visible slider, mirror the existing Top Labels pattern (range + numeric input, debounced).

**Tasks**:
- [x] In `labelSettingsPanel.component.html`, add a slider block under Top Labels with `min="0.75" max="2.5" step="0.25"`, a numeric input with `×` suffix label, and `title="Scale floating label font size"`.
- [x] In `labelSettingsPanel.component.ts`, add `labelSize` signal, `applyDebouncedLabelSize` (400 ms), `handleLabelSizeInput(event)` parsing as float, clamping to `[MIN_LABEL_SIZE, MAX_LABEL_SIZE]`, and snapping to `LABEL_SIZE_STEP` (parseNumberInput uses parseInt and is unsuitable for fractional values).
- [x] Add `"appSettings.labelSize"` to `resetSettingsKeys`.
- [x] Extend `labelSettingsPanel.component.spec.ts` with: (a) slider rendered with default value, (b) input dispatches `setLabelSize`, (c) clamp test, (d) reset button dispatches with default value.

**Automated Verification**:
- [x] New panel tests pass (slider visible, dispatch, clamp, reset).
- [x] `npm test` passes (350 suites, 2020 tests).
- [x] `npm run build` passes.
- [x] `npm run format:check` passes from repo root.

**Manual Verification**:
- [ ] Open the labels modal in a dev build (`npm run dev`), drag "Label Size" between 0.75× and 2.5×, confirm floating labels resize live (name + metric + "+N more" badge) and remain legible on a screenshot at 2×.
- [ ] Switch between Height / Color label modes with `labelSize = 2.0` and confirm both modes pick up the new size on next render.
- [ ] Save a scenario at `labelSize = 2.0`, reload page, re-apply scenario, confirm slider reads `2.0×` and labels render large.
- [ ] Click "Reset label settings", confirm slider snaps back to `1.0×` and labels return to default size.

---

## Steps

- [x] Complete Phase 1: State plumbing
- [x] Complete Phase 2: Apply size to floating labels
- [x] Complete Phase 3: Slider UI in labels modal (manual verification still pending)

## References

- Pattern mirror: `state/store/appSettings/amountOfTopLabels/` (reducer/actions/selector)
- Pattern mirror: `features/labelSettings/services/amountOfTopLabels.service.ts`, `stores/amountOfTopLabels.store.ts`
- UI pattern source: `features/labelSettings/components/labelSettingsPanel/labelSettingsPanel.component.html` (Top Labels slider, lines 1–11)
- Render pipeline trigger: `state/effects/renderCodeMapEffect/actionsRequiringRerender.ts`
- Scenario integration: `features/scenarios/model/scenario.model.ts:34` (`LabelsAndFoldersSection`)
