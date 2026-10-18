---
name: dependency-view-not-experimental
issue: none
state: complete
version: 1.0.0
---

## Goal

Make the dependency view of the visualization a regular view: the **Dependencies** tab appears whenever the loaded
map carries dependency data, without the experimental switch in the Global Configuration. The dependency parser on the
analysis side stays experimental.

## Tasks

### 1. Remove the switch and its preference
- Delete the toggle from the Global Configuration dialog and its handler in `globalSettings.write.store.ts`
- Delete the `dependencyViewEnabled` preference: actions, reducer, selector, facades, `Preferences` model, mocks and
  the `loadInitialFile.store.ts` case
- The view switcher reads `hasDependencyDataSelector` directly, so `isDependencyViewAvailableSelector` goes; the node
  context menu reads only whether the map has dependency data

### 2. Drop the saved value
- IndexedDB migration v34 removes `preferences.dependencyViewEnabled`, so a value saved before the change is neither
  read nor kept
- Keep v28, which added the key, so older records still migrate step by step

### 3. Redirect only for missing data
- `RedirectAwayFromDependencyViewEffect` loses the "switched off" reason and its toast; it still sends a map without
  dependency data to the map view

### 4. Tests
- Remove the specs of the deleted preference, adapt the specs that set it (dialog, context menu, extension bar,
  redirect effect, initial file loading, IndexedDB writer)
- e2e `dependencyView.e2e.ts` opens the tab without switching anything on

### 5. Docs and changelog
- `dependency-view.md`: drop the caution box and the second condition for opening the view
- `settings.md`, `views.md`: drop the switch
- `visualization/CHANGELOG.md`: a **Changed** entry, since 2.8.0 shipped the view as experimental

## Steps

- [x] Complete Task 1: Remove the switch and its preference
- [x] Complete Task 2: Drop the saved value (TDD)
- [x] Complete Task 3: Redirect only for missing data (TDD)
- [x] Complete Task 4: Tests
- [x] Complete Task 5: Docs and changelog
- [x] `npm run format:check`, `npm test`, `npm run lint`, `npx tsc --noEmit -p tsconfig.json`, `npm run e2e`

## Notes

- Branched from `feature/angular-and-sql-support`, so it merges after that branch
- One commit: removing the preference is what makes the tab always available, so the two cannot be separated
- A record saved before v34 that still holds the setting is passed over by `applyPreferences`, which reads only the
  keys of today's preferences
