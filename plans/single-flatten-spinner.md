---
name: Single flatten settles like a rule
issue: -
state: complete
version: -
---

## Goal

Flattening, unflattening or excluding a single path keeps the loading overlay up for at least 350 ms after the map
has rendered, so it fades in; a metric rule clears it as soon as the map is drawn. Make path entries behave like
rules.

## Tasks

### 1. Tests first
- `LoadingIndicatorEffect`: a path-entry action no longer marks the views stale

### 2. Stop marking views stale on path entries
- Drop the blacklist actions from `markViewsStaleOnDataChange$`; every path-entry change already goes through
  `dispatchAfterPaint`, whose flag the render clears
- The domain view does not read path entries and cannot change them, so it needs no stale mark

### 3. Verify in the browser
- Right-click flatten: overlay never visible on the sample map

### 4. Changelog
- Extend the existing Fixed entry for the loading flash

## Steps

- [x] Complete Task 1: Tests first
- [x] Complete Task 2: Stop marking views stale on path entries
- [x] Complete Task 3: Verify in the browser
- [x] Complete Task 4: Changelog

## Notes

- The removed test said "so the hidden view rebuilds on switch"; that still holds for file-set changes, not path
  entries. Domain words come from `domainWordsSelector` (file data) and `viewIndependentTreeSelector`; neither reads
  path entries. The domain view cannot create them (`showRules: false`, flatten/exclude inside
  `@if (showMapActions)`), so the metrics view is never hidden when one changes.
- Every dispatch of the path-entry actions goes through `dispatchAfterPaint`, directly or via an effect reacting to
  an action that did (file-extension bar, search-pattern rules, empty-map guard).
