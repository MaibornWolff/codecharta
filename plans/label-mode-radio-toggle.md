---
name: Label Mode Radio Toggle
issue: none
state: complete
version: 1
---

## Goal

Add a DaisyUI join radio button group to the label settings panel to toggle between "Height" and "Color" label modes. Height mode shows labels for the tallest buildings; Color mode shows labels by color metric with positive/neutral/negative checkboxes.

## Tasks

### 1. Add ngrx state for labelMode
- New enum `LabelMode` with values `height` and `color` in `codeCharta.model.ts`
- Action: `setLabelMode`
- Reducer: default to `height`
- Selector: `labelModeSelector`
- Add to `appSettings` state slice
- Add to reset settings keys

### 2. Update label settings panel UI
- Add DaisyUI join radio group above the slider (Height | Color)
- Show "By Color Metric" section only when Color mode is selected
- Keep slider and show-name/show-value checkboxes in both modes

### 3. Update render logic
- In `codeMap.render.service.ts` `setLabels()`, use `labelMode` from state
- Height mode: always use height-sorted top N labels (current fallback)
- Color mode: use color-category labels (current color label behavior)

### 4. Update tests
- Spec for new reducer
- Update labelSettingsPanel specs
- Update render service specs
- Update resetSettings/scenario specs if needed

## Steps

- [x] Add LabelMode enum and ngrx boilerplate
- [x] Update labelSettingsPanel template with join radio group
- [x] Update render service to use labelMode
- [x] Update and add tests
- [x] Run tests to verify

## Post-Merge TODOs

After merging main (which migrated scenarios to native dialog + DaisyUI + signals), `labelMode` and `groupLabelCollisions` are missing from the new scenario code. Add both to:
- [ ] `LabelsAndFoldersSection` interface in `features/scenarios/model/scenario.model.ts`
- [ ] `buildScenarioSections` in `features/scenarios/services/scenarios.service.ts`
- [ ] `buildLabelsAndFoldersPatch` in `features/scenarios/services/scenarioApplier.service.ts`

## Notes

- DaisyUI is already a dependency in the visualization project
- The join component uses `class="join"` with `class="join-item btn"` on children
- When Height is selected, color checkboxes are hidden; when Color is selected they show
