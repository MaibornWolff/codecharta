---
name: Refactor GlobalSettings into Domain-Focused Services
issue: N/A
state: complete
version: 1.137.0
---

## Goal

Refactor the GlobalSettings feature to use single-responsibility services with domain-focused names instead of one large technical service. Each setting gets its own service/store pair using domain language that describes what it does, not the technical implementation.

## Domain Service Mapping

Current technical names → Domain-focused service names:

1. `sharpnessMode` → **DisplayQuality** (controls render quality/sharpness)
2. `layoutAlgorithm` + `maxTreeMapFiles` → **MapLayout** (controls how the map is laid out)
3. `isWhiteBackground` → **BackgroundTheme** (controls background appearance)
4. `hideFlatBuildings` → **FlatBuildingVisibility** (controls visibility of flat buildings)
5. `resetCameraIfNewFileIsLoaded` → **AutomaticCameraReset** (controls automatic camera behavior)
6. `screenshotToClipboardEnabled` → **ScreenshotDestination** (controls where screenshots go)
7. `experimentalFeaturesEnabled` → **ExperimentalFeatures** (controls experimental feature access)

## New Structure

```
features/globalSettings/
  services/
    displayQuality.service.ts          (sharpnessMode)
    mapLayout.service.ts               (layoutAlgorithm, maxTreeMapFiles)
    backgroundTheme.service.ts         (isWhiteBackground)
    flatBuildingVisibility.service.ts  (hideFlatBuildings)
    automaticCameraReset.service.ts    (resetCameraIfNewFileIsLoaded)
    screenshotDestination.service.ts   (screenshotToClipboardEnabled)
    experimentalFeatures.service.ts    (experimentalFeaturesEnabled)
  stores/
    displayQuality.store.ts
    mapLayout.store.ts
    backgroundTheme.store.ts
    flatBuildingVisibility.store.ts
    automaticCameraReset.store.ts
    screenshotDestination.store.ts
    experimentalFeatures.store.ts
  selectors/
    globalSettings.selectors.ts (keep existing selectors)
  components/ (existing)
  types/ (existing)
  facade.ts (update to export services)
```

## Tasks

### 1. Create Domain Service: DisplayQuality
- Create `displayQuality.service.ts` with methods:
  - `sharpnessMode$()` - read current sharpness mode
  - `setSharpnessMode(value: SharpnessMode)` - write sharpness mode
- Create `displayQuality.store.ts` that injects Store
- Uses `sharpnessModeSelector` and `setSharpnessMode` action

### 2. Create Domain Service: MapLayout
- Create `mapLayout.service.ts` with methods:
  - `layoutAlgorithm$()` - read current layout algorithm
  - `maxTreeMapFiles$()` - read max tree map files
  - `setLayoutAlgorithm(value: LayoutAlgorithm)` - write layout algorithm
  - `setMaxTreeMapFiles(value: number)` - write max files
- Create `mapLayout.store.ts` that injects Store
- This service handles TWO related settings that are always used together

### 3. Create Domain Service: BackgroundTheme
- Create `backgroundTheme.service.ts` with methods:
  - `isWhiteBackground$()` - read background theme
  - `setWhiteBackground(value: boolean)` - write background theme
- Create `backgroundTheme.store.ts` that injects Store
- Uses `isWhiteBackgroundSelector` and `setIsWhiteBackground` action

### 4. Create Domain Service: FlatBuildingVisibility
- Create `flatBuildingVisibility.service.ts` with methods:
  - `hideFlatBuildings$()` - read visibility setting
  - `setHideFlatBuildings(value: boolean)` - write visibility setting
- Create `flatBuildingVisibility.store.ts` that injects Store
- Uses `hideFlatBuildingsSelector` and `setHideFlatBuildings` action

### 5. Create Domain Service: AutomaticCameraReset
- Create `automaticCameraReset.service.ts` with methods:
  - `resetCameraIfNewFileIsLoaded$()` - read reset behavior
  - `setResetCameraIfNewFileIsLoaded(value: boolean)` - write reset behavior
- Create `automaticCameraReset.store.ts` that injects Store
- Uses `resetCameraIfNewFileIsLoadedSelector` and `setResetCameraIfNewFileIsLoaded` action

### 6. Create Domain Service: ScreenshotDestination
- Create `screenshotDestination.service.ts` with methods:
  - `screenshotToClipboardEnabled$()` - read destination setting
  - `setScreenshotToClipboard(value: boolean)` - write destination setting
- Create `screenshotDestination.store.ts` that injects Store
- Uses `screenshotToClipboardEnabledSelector` and `setScreenshotToClipboardEnabled` action

### 7. Create Domain Service: ExperimentalFeatures
- Create `experimentalFeatures.service.ts` with methods:
  - `experimentalFeaturesEnabled$()` - read feature flag
  - `setExperimentalFeaturesEnabled(value: boolean)` - write feature flag
- Create `experimentalFeatures.store.ts` that injects Store
- Uses `experimentalFeaturesEnabledSelector` and `setExperimentalFeaturesEnabled` action

### 8. Create ResetSettings Service
- Create `resetSettings.service.ts` with method:
  - `resetSettings(settingsKeys: string[])` - reset multiple settings to defaults
- Create `resetSettings.store.ts` that injects Store + State
- Uses `setState` action and `getPartialDefaultState` utility
- Special case: needs State injection for reading current state

### 9. Update Components to Use Domain Services
- `DisplayQualitySelectionComponent` → inject `DisplayQualityService`
- `MapLayoutSelectionComponent` → inject `MapLayoutService`
- `GlobalConfigurationDialogComponent` → inject multiple domain services
- `ResetSettingsButtonComponent` → inject `ResetSettingsService`

### 10. Update Facade
- Export all domain services from facade.ts
- Keep selectors export for external usage
- Remove old `GlobalSettingsService`

### 11. Delete Old Service and Store
- Remove `globalSettings.service.ts`
- Remove `globalSettings.store.ts`
- Verify no other files reference them

### 12. Update Tests
- Create test file for each new service
- Create test file for each new store
- Update component tests to use domain services
- Remove old service/store tests

### 13. Update External Usages
- Check if any external features use GlobalSettingsService
- Update them to use specific domain services from facade
- Or inject the domain services directly

## Steps

- [ ] Create DisplayQualityService + Store
- [ ] Create MapLayoutService + Store
- [ ] Create BackgroundThemeService + Store
- [ ] Create FlatBuildingVisibilityService + Store
- [ ] Create AutomaticCameraResetService + Store
- [ ] Create ScreenshotDestinationService + Store
- [ ] Create ExperimentalFeaturesService + Store
- [ ] Create ResetSettingsService + Store
- [ ] Update DisplayQualitySelectionComponent to use DisplayQualityService
- [ ] Update MapLayoutSelectionComponent to use MapLayoutService
- [ ] Update GlobalConfigurationDialogComponent to inject domain services
- [ ] Update ResetSettingsButtonComponent to use ResetSettingsService
- [ ] Update facade.ts to export domain services
- [ ] Delete old GlobalSettingsService
- [ ] Delete old GlobalSettingsStore
- [ ] Add tests for all new services
- [ ] Add tests for all new stores
- [ ] Update component tests
- [ ] Check and update external usages
- [ ] Run architecture linting
- [ ] Run full test suite
- [ ] Verify build works

## Pattern for Other Features

This domain-focused, single-responsibility pattern should become the standard for all features:

**Guidelines:**
1. **One service per domain concept** (not per technical setting)
2. **Domain names** that describe WHAT it does, not HOW it works
3. **Service exposes methods** (not observable properties)
4. **Store injects Store/State** (only place in feature that does)
5. **Related settings can share a service** (e.g., MapLayout has 2 settings that are always used together)

**Naming Convention:**
- Service: `{DomainConcept}.service.ts` (e.g., `displayQuality.service.ts`)
- Store: `{DomainConcept}.store.ts` (e.g., `displayQuality.store.ts`)
- Use clear, descriptive domain language
- Avoid technical implementation terms

**When to Group Settings:**
- Group settings that are ALWAYS used together (e.g., layoutAlgorithm + maxTreeMapFiles)
- Keep settings separate if they might be used independently
- Default to separate unless there's a clear domain relationship

## Notes

- This refactoring maintains backward compatibility through the facade
- External features import services from facade
- Components inject specific domain services they need
- Architecture rules still enforced: only stores/ folder injects Store/State
- Pattern can be documented as the standard for all features
- Domain language makes code more readable and maintainable
- Single responsibility makes testing easier
- Clear boundaries between concerns
