---
name: Scenarios — Unified Saved Application State (Phases 1-2)
issue: <#tbd>
state: complete
version: 1.0
---

## Goal

Replace three separate ribbon bar features (Metric Scenarios, Custom Views, Suspicious Metrics) with a single unified "Scenarios" panel that supports full state snapshots, IndexedDB persistence, and selective section apply.

## Tasks

### 1. Data model
- Created `features/scenarios/model/scenario.model.ts` with structured sections (Metrics, Colors, Camera, Filters, LabelsAndFolders)
- Camera stores plain `{x, y, z}` objects for IndexedDB compatibility

### 2. IndexedDB persistence
- Bumped `DB_VERSION` to 2, added `scenarios` store in upgrade handler
- Created CRUD functions in `scenarioIndexedDB.ts`

### 3. Scenario builder + applier + missing metrics checker
- `scenarioBuilder.ts`: pure function extracting CcState + camera into sections
- `scenarioApplier.ts`: builds partial state from selected sections, reconstructs Vector3 for camera
- `getMissingMetrics.ts`: checks metric availability against MetricData

### 4. ScenariosService facade
- Orchestrates IndexedDB CRUD, builder, applier
- Exposes `scenarios$` BehaviorSubject

### 5. UI components
- `scenariosPanel`: ribbon bar entry with list + save buttons
- `scenarioListDialog`: flat list with search, warning icons, apply/delete
- `saveScenarioDialog`: name (required) + description (optional)
- `applyScenarioDialog`: section checklist + missing-metric warning (Phase 2)

### 6. Ribbon bar integration + old code removal
- Replaced 3 old panels with single Scenarios panel
- Deleted: `showScenariosButton/`, `customConfigs/`, `artificialIntelligence/`, `customConfigHelper.ts`, `customConfigBuilder.ts`, `customConfig.api.model.ts`, `scenarios.json`
- Cleaned imports from `codeCharta.model.ts`, `codeCharta.api.model.ts`, `dataMocks.ts`, `uploadFiles.service.ts`, `ribbonBar.component.spec.ts`, `resetMapButton.component.spec.ts`

## Steps

- [x] Complete Task 1: Data model
- [x] Complete Task 2: IndexedDB persistence
- [x] Complete Task 3: Scenario builder + applier + missing metrics
- [x] Complete Task 4: ScenariosService facade
- [x] Complete Task 5: UI components
- [x] Complete Task 6: Ribbon bar integration + cleanup
- [x] Run tests — 335 suites, 1871 tests all passing

## Notes

- Old `Scenario` type removed from `codeCharta.model.ts`; new type lives in `features/scenarios/model/`
- `ExportScenario` removed from `codeCharta.api.model.ts`
- Custom config file import/upload removed from `uploadFiles.service.ts`
