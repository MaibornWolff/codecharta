---
name: migrate-label-settings-to-feature
issue: #
state: complete
version: 1
---

## Goal

Migrate all label options from `ui/ribbonBar/labelSettingsPanel/` and `ui/codeMap/codeMap.label.service.ts` into a self-contained `features/labelSettings/` module. Apply the full features architecture: facade pattern, layered stores/services, Angular signals, zoneless-compatible patterns, DaisyUI (no SCSS), and dependency-cruiser compliance.

## Context

### Current state
- **UI**: `ui/ribbonBar/labelSettingsPanel/` — uses ngrx Store directly, MatCheckbox, AsyncPipe, SCSS, no signals
- **Rendering**: `ui/codeMap/codeMap.label.service.ts` — CSS2D label creation, collision resolution, connector drawing (427 lines)
- **State**: 5 ngrx slices in `state/store/appSettings/` — `labelMode`, `amountOfTopLabels`, `showMetricLabelNodeName`, `showMetricLabelNameValue`, `colorLabels`
- **Wrapper**: `labelSettings.component.ts` — opens panel via MatMenu

### Target architecture (matching existing features)
```
features/labelSettings/
  facade.ts                          # Public API for external consumers
  stores/
    labelMode.store.ts               # Wraps ngrx labelMode slice
    amountOfTopLabels.store.ts       # Wraps ngrx amountOfTopLabels slice
    showMetricLabelNodeName.store.ts
    showMetricLabelNameValue.store.ts
    colorLabels.store.ts
  selectors/
    labelSettings.selectors.ts       # Composite selectors if needed
  services/
    labelMode.service.ts             # Delegates to store
    amountOfTopLabels.service.ts
    showMetricLabelNodeName.service.ts
    showMetricLabelNameValue.service.ts
    colorLabels.service.ts
    labelCreation.service.ts         # CSS2D label creation + styling (from codeMap.label.service.ts)
    labelCollision.service.ts        # Collision detection + resolution + connectors (from codeMap.label.service.ts)
  components/
    labelSettingsButton/             # Replaces labelSettings.component (wrapper with menu trigger)
      labelSettingsButton.component.ts
      labelSettingsButton.component.html
    labelSettingsPanel/              # Migrated + modernized panel
      labelSettingsPanel.component.ts
      labelSettingsPanel.component.html
      labelSettingsPanel.component.spec.ts
```

### Architectural rules (enforced by dependency-cruiser)
1. **Only stores/ can import `@ngrx/store`** — services and components must not
2. **Services are feature-internal** — external code uses facade only
3. **No SCSS files** — use DaisyUI/Tailwind classes in templates
4. **No circular deps** between features
5. **types/ cannot import services/stores/effects**

### Component patterns (mandatory)
- Standalone components (no NgModules)
- `inject()` instead of constructor injection
- `signal()`, `computed()`, `toSignal()`, `input()`, `output()` — no OnInit/OnDestroy
- `effect()` for side effects instead of manual subscriptions
- No `AsyncPipe` — convert observables with `toSignal(obs$, { requireSync: true })`
- Replace MatCheckbox with DaisyUI `<input type="checkbox" class="toggle toggle-primary" />`
- Replace MatMenu with native `<dialog>` or DaisyUI dropdown
- No SCSS files — all styling via Tailwind/DaisyUI utility classes in template

### Store/service patterns (mandatory)
- `@Injectable({ providedIn: "root" })` for all stores/services/facade
- Stores: expose Observable streams from selectors, dispatch actions
- Services: delegate to stores, expose business logic
- Facade: delegates to services, is the only public API

## Tasks

### 1. Create feature directory structure
- Create `features/labelSettings/` with `stores/`, `services/`, `selectors/`, `components/` directories
- Create `facade.ts` following globalSettings pattern

### 2. Create stores (ngrx wrappers)
- `labelMode.store.ts` — wraps `labelModeSelector` + `setLabelMode` action
- `amountOfTopLabels.store.ts` — wraps selector + action
- `showMetricLabelNodeName.store.ts` — wraps selector + action
- `showMetricLabelNameValue.store.ts` — wraps selector + action
- `colorLabels.store.ts` — wraps selector + action
- Each store: `@Injectable({ providedIn: "root" })`, inject `Store`, expose `$()` observable method, expose `set()` dispatch method
- Write spec files with MockStore for each

### 3. Create services (delegates to stores)
- One service per store, same naming pattern
- Each service: `@Injectable({ providedIn: "root" })`, inject corresponding store, delegate methods
- Write spec files for each

### 4. Split CodeMapLabelService into two feature services
- `labelCreation.service.ts` — `addLeafLabel()`, `clearLabels()`, `clearTemporaryLabel()`, `hasLabelForNode()`, `suppressLabelForNode()`, `restoreSuppressedLabel()`, `createLabelElement()`, styling, lifecycle
- `labelCollision.service.ts` — `updateLabelLayout()`, collision resolution, connector SVG drawing, tooltip collision detection
- Both inject Three.js services via `inject()`
- Convert constructor subscription to `effect()` or keep as injection-time setup
- Write spec files

### 5. Create facade
- Aggregate all services
- Expose label rendering methods (for CodeMapRenderService to call)
- Expose settings observables (for any external consumer)

### 6. Migrate UI components
- `labelSettingsButton/` — replace MatMenu with DaisyUI dropdown or native dialog, use signals, inject facade
- `labelSettingsPanel/` — replace MatCheckbox with DaisyUI toggles/checkboxes, remove SCSS, use `toSignal()`, inject services (within feature boundary), no direct ngrx imports
- Convert all template `async` pipes to signal reads
- Replace SCSS styles with Tailwind/DaisyUI utility classes
- Migrate and adapt spec file

### 7. Update external consumers
- `CodeMapRenderService` — import from facade instead of CodeMapLabelService
- `ribbonBar.component` — import new `LabelSettingsButtonComponent` instead of old wrapper
- Any other consumers of the old label service

### 8. Add dependency-cruiser rule
- Add `feature-labelSettings-no-external-access-to-services` rule (same pattern as globalSettings/changelog)
- Add SCSS rule for this branch if not already rebased from main

### 9. Delete old files
- Remove `ui/ribbonBar/labelSettingsPanel/` directory (all files)
- Remove `ui/codeMap/codeMap.label.service.ts` and its spec
- Clean up any orphaned imports

### 10. Verify
- Run `npm test` — all label tests pass
- Run dependency-cruiser — no violations
- Verify facade is the only external entry point
- Verify no SCSS in features/

## Steps

- [x] Rebase on main to get the SCSS restriction rule
- [x] Create directory structure + facade skeleton
- [x] Create stores with specs
- [x] Create setting services with specs
- [x] Split CodeMapLabelService into labelCreation + labelCollision services with specs
- [x] Create facade wiring all services
- [x] Migrate labelSettingsPanel component (signals, DaisyUI, no SCSS)
- [x] Create labelSettingsButton component (DaisyUI dropdown, replaces MatMenu wrapper)
- [x] Migrate and adapt panel spec file
- [x] Update CodeMapRenderService to use facade
- [x] Update ribbonBar to use new button component
- [x] Add dependency-cruiser rule for labelSettings
- [x] Delete old files
- [x] Run tests and dependency-cruiser validation

## Notes

- Floor labels (enableFloorLabels, floorLabelDrawer) are **excluded** from this migration
- ngrx slices stay in `state/store/appSettings/` — stores only wrap them
- The `colorCategoryCounts$` observable from CodeMapRenderService needs to be accessible — either via facade or direct import (since render service is outside the feature)
- The label rendering services have Three.js dependencies (ThreeSceneService, ThreeRendererService) — these remain external imports
- `resetSettingsKeys` for the reset button need to reference the correct ngrx paths
