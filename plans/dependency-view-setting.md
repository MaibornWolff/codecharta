---
name: Setting to enable the dependency view
issue: -
state: complete
version: -
---

## Goal

The dependency view is experimental, so a global setting "Enable Dependency View (experimental)", off by
default, decides whether it can be reached at all: the view tab, the context menu jumps to it and its
route.

## Tasks

### 1. Preference
- `preferences.dependencyViewEnabled` (default `false`): action, reducer, selector, read window, facades
- Restore it from a loaded state (`loadInitialFile.store`), IndexedDB migration v28 adding the default

### 2. Global settings toggle
- "Enable Dependency View (experimental)" in the global configuration dialog

### 3. Gate every way in
- View switcher: the Dependencies tab shows only when enabled and the files carry levels
- Node context menu: no "show in dependencies" jump while disabled
- Route: arriving at or staying on the dependency view while disabled sends the reader to the metrics
  view with a toast naming the setting

### 4. Tests and changelog
- Unit tests for each gate; the dependency view e2e test switches the setting on first
- Rewrite the unreleased dependency view entry to name the setting

## Steps

- [x] Complete Task 1: Preference
- [x] Complete Task 2: Global settings toggle
- [x] Complete Task 3: Gate every way in
- [x] Complete Task 4: Tests and changelog

## Notes

- Replaces the removed global "Enable Experimental Features" setting with one for this view alone
- The route check waits for loaded files: the saved setting is restored before them, so reading it earlier
  would send a refresh on the dependency view away before the setting is back
