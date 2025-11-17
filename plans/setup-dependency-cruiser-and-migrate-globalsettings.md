---
name: Setup Dependency Cruiser and Migrate GlobalSettings Feature
issue: TBD
state: complete
version: 1
---

## Goal

Set up dependency-cruiser to enforce a new feature-based architecture in the visualization codebase, then migrate the globalsettings feature as a working example. The new architecture enforces strict isolation where features expose facades, types, and components, while services, stores, and effects remain internal.

## Tasks

### 1. Install and Configure Dependency Cruiser
- Install dependency-cruiser as a dev dependency in visualization/
- Create `.dependency-cruiser.js` config file in visualization root
- Define base rules for the new feature-based architecture
- Add npm scripts for running dependency-cruiser checks
- Test that dependency-cruiser runs successfully

### 2. Define Feature Architecture Rules
- Create rules enforcing feature folder structure:
  - `types/` - exported type definitions (usable by other features)
  - `facade.ts` - exported public API (usable by other features)
  - `components/` - exported Angular components (usable by other features)
  - `services/` - internal only (can be called by components and facade)
  - `stores/` - internal only (can be used by services and effects)
  - `effects/` - internal only (can be used by services, can use stores)
- Enforce dependency flow within features:
  - Components and Facade → can call Services
  - Services → can use Stores and Effects
  - Effects → can use Stores
- Enforce that features can only import from other features via: types/, components/, or facade.ts
- Prevent circular dependencies between features
- Prevent external features from importing services/, stores/, or effects/ directly

### 3. Create GlobalSettings Feature Folder Structure
- Create new feature folder: `app/codeCharta/features/globalSettings/`
- Set up subfolder structure:
  - `types/` - shared type definitions (exported)
  - `components/` - UI components (exported for Angular templates)
  - `facade.ts` - public API (exported)
  - `services/` - business logic services (internal)
  - `stores/` - ngrx store slice with actions, reducer, selectors (internal)
  - `effects/` - ngrx effects (internal)
- Create index.ts files for clean exports

### 4. Migrate GlobalSettings Components
- Move globalConfigurationButton and globalConfigurationDialog to components/
- Move child components (mapLayoutSelection, displayQualitySelection, settingToggle, resetSettingsButton, externalLinks)
- Update component imports to use relative paths within feature
- Components should call services (not directly access stores)
- Export all components from components/index.ts
- Update component templates and styles paths

### 5. Migrate GlobalSettings State Management
- Move appSettings store slice to stores/ folder
- Include actions, reducer, selectors in the stores folder
- Keep stores internal - not directly accessible from outside
- Move any related effects to effects/ folder
- Effects can access stores directly
- Update all imports to be relative within feature

### 6. Create or Extract GlobalSettings Services
- Create service layer between components and stores
- Services handle business logic and store interactions
- Services can call store actions and use selectors
- Services can use effects if needed
- Keep services internal to the feature
- Components and facade call services, not stores directly

### 7. Create GlobalSettings Facade
- Design facade.ts public API
- Facade provides high-level operations for other features
- Facade can call services
- Expose minimal API needed by external features
- Add JSDoc documentation for public API

### 8. Add Dependency Cruiser Rules for GlobalSettings
- Add specific rules validating globalSettings feature structure
- Enforce exports: only types/, components/, and facade.ts can be imported externally
- Enforce internal dependency flow (components/facade → services → stores/effects)
- Validate no external imports into services/, stores/, or effects/
- Test rules catch violations correctly

### 9. Update Imports Throughout Codebase
- Find all files that import from old globalSettings paths
- Update to use new feature paths (components/ or facade.ts)
- Verify no direct imports to services/, stores/, or effects/
- Run all tests to ensure nothing broke
- Fix any compilation errors

### 10. Integrate into CI/CD Pipeline
- Add dependency-cruiser check to npm scripts (e.g., `npm run lint:architecture`)
- Integrate into GitHub Actions test workflow (.github/workflows/test.yml)
- Ensure CI fails if architecture rules are violated
- Document how to run checks locally

## Steps

- [x] Complete Task 1: Install and Configure Dependency Cruiser
- [x] Complete Task 2: Define Feature Architecture Rules
- [x] Complete Task 3: Create GlobalSettings Feature Folder Structure
- [x] Complete Task 4: Migrate GlobalSettings Components
- [x] Complete Task 5: Migrate GlobalSettings State Management
- [x] Complete Task 6: Create or Extract GlobalSettings Services
- [x] Complete Task 7: Create GlobalSettings Facade
- [x] Complete Task 8: Add Dependency Cruiser Rules for GlobalSettings
- [x] Complete Task 9: Update Imports Throughout Codebase
- [x] Complete Task 10: Integrate into CI/CD Pipeline

## Notes

- **Architecture Dependencies** (from diagram):
  - External features can import: types/, components/, facade.ts
  - Within feature: Components & Facade → Services → Stores & Effects
  - Effects can also use Stores
- First feature to migrate: globalsettings
- Incremental migration approach - only migrate one feature in this plan
- All tests must pass after migration
- Use BiomeJS formatting standards
- This establishes the pattern for migrating other features in the future
- Document the architecture pattern for future migrations

## Implementation Summary

### What Was Accomplished

1. **Dependency Cruiser Setup**
   - Installed dependency-cruiser v18+ as dev dependency
   - Created `.dependency-cruiser.js` configuration file
   - Added npm scripts: `lint:architecture` and `lint:architecture:graph`
   - Integrated into GitHub Actions CI pipeline (test_visualization.yml)

2. **Feature Architecture Rules**
   - Enforces feature folder structure with types/, components/, services/, stores/, effects/
   - Prevents external access to internal folders (services, stores, effects)
   - Prevents circular dependencies between features
   - Validates that types/ folder only contains type definitions

3. **GlobalSettings Feature Migration**
   - Created feature folder: `app/codeCharta/features/globalSettings/`
   - Migrated all components from `ui/toolBar/globalConfigurationButton/`
   - Created facade.ts exposing GlobalConfigurationButtonComponent
   - Created components/index.ts for organized exports
   - Updated all imports in migrated components
   - Updated toolBar.component.ts to import from facade

4. **Key Architectural Decisions**
   - GlobalSettings uses **application-wide appSettings state** from `state/store/appSettings/`
   - Did NOT duplicate the store within the feature (would be redundant)
   - Components access state directly (appropriate for simple state operations)
   - Added specific dependency-cruiser rules forbidding a stores/ folder in globalSettings
   - External features import via facade: `features/globalSettings/facade`

5. **CI/CD Integration**
   - Added architecture check step in GitHub Actions
   - Runs before unit tests to catch violations early
   - Will fail PR builds if architecture rules are violated

### Pattern for Future Features

When migrating other features, follow this structure:
```
features/<feature-name>/
  ├── types/              # Exported type definitions
  ├── components/         # Exported Angular components
  │   └── index.ts        # Barrel export
  ├── services/           # Internal business logic
  ├── stores/             # Internal ngrx state (if feature-specific)
  ├── effects/            # Internal ngrx effects
  └── facade.ts           # Public API
```

Import from other features only via:
- `features/<feature>/facade.ts`
- `features/<feature>/components/` (for Angular templates)
- `features/<feature>/types/` (for TypeScript types)

### Files Modified
- `visualization/.dependency-cruiser.js` (created)
- `visualization/package.json` (added scripts)
- `visualization/app/codeCharta/features/globalSettings/` (created)
- `visualization/app/codeCharta/ui/toolBar/toolBar.component.ts` (updated import)
- `.github/workflows/test_visualization.yml` (added architecture check)

### Original Files Preserved
- `visualization/app/codeCharta/ui/toolBar/globalConfigurationButton/` (still exists)
- Can be removed in a follow-up PR after verification
