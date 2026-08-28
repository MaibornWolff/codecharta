---
name: explorer-view-bleeding
issue: none
state: complete
version: 1
---

## Goal

Remove the remaining state bleeding between the domain and metrics file explorers so the shared
sidebarExplorer feature has no direct dependency on sharedView/renderModel state — everything
view-specific flows through ports, like search/sort/tree already do.

## Tasks

### 1. Route marked-package icon colors through a port

- `explorerTreeItemIcon.component.ts` injects `SharedViewReadWindow.markedPackages$` directly, so
  the domain tree is colored by the metrics view's marked packages.
- Extend the `EXPLORER_ROW` projection (or add a small `EXPLORER_DECORATION` port) with an icon
  color; metrics implements it from marked packages, domain returns none.
- Remove the `SharedViewReadWindow` import from the shared feature.

### 2. Give the domain view its own searched-node matching

- `DOMAIN_EXPLORER_SEARCH` falls back to `createSearchedNodePathsSelector`, which matches against
  renderModel's `accumulatedDataSelector` (metrics pipeline, sharedView blacklist, empty until
  metric data exists).
- Build the domain `searchedNodePathsSelector` on `viewIndependentTreeSelector` — the same tree the
  domain explorer renders — and pass it in the config.
- Drop the renderModel fallback from `provideExplorerSearch` so every view states its own matcher
  explicitly.

### 3. Introduce an EXPLORER_COUNTS port

- `explorerCountsSelector` and `SidebarExplorerReadStore.counts$` are hard-wired to renderModel +
  mapState. Define an `EXPLORER_COUNTS` port; metrics provides it from the existing selectors,
  domain provides none (capability stays off).
- `explorerHeader.component.ts` consumes the port instead of the root-singleton store.

### 4. Introduce an EXPLORER_RULES port

- Rules state (`flattenRulesWithCount$`, `isFlattenPatternDisabled$`, `isExcludePatternDisabled$`,
  `removeBlacklistItem`, `blacklistSearchPattern`) lives in root singletons bound to sharedView.
- Define an `EXPLORER_RULES` port covering reads and actions; metrics implements it from
  sharedView + the `blacklistSearchPattern` effect, domain provides none.
- `rulesPopover`, `ruleRow`, and `explorerSearchActions` consume the port; delete
  `SidebarExplorerReadStore`/`SidebarExplorerWriteStore` once empty.
- Move the metrics-bound selectors and the `blacklistSearchPattern` effect to the metrics view (or
  a metrics-owned adapter folder) so the shared feature has no sharedView imports left.

### 5. Clean up the facade

- Remove `isSearchPatternEmptySelector` (sharedView-bound) from the shared feature's `facade.ts`;
  metrics keeps it next to `METRICS_EXPLORER_SEARCH`.
- Verify the facade exports nothing that imports sharedView or renderModel.

### 6. Scope explorer DOM lookups

- Row `id="{{ node().path }}"` and `document.querySelector("#explorer-scroll")` are global; safe
  only while the router mounts one view at a time.
- Resolve the scroll host via injected element reference instead of a global selector; prefix row
  ids with the explorer storage scope (keep `scrollRowIntoView` working).

## Steps

- [x] Complete Task 1: Marked-package colors through port
- [x] Complete Task 2: Domain searched-node matching
- [x] Complete Task 3: EXPLORER_COUNTS port
- [x] Complete Task 4: EXPLORER_RULES port
- [x] Complete Task 5: Facade cleanup
- [x] Complete Task 6: Scoped DOM lookups
- [x] Guard rule `sidebar-explorer-is-view-agnostic` in `.dependency-cruiser.js` (replaces
      `sidebar-explorer-does-not-write-view-selection`): the feature may not import sharedView,
      mapState, domainState or renderer/ at all. Verified it fails on an injected violation.

## Notes

- Decision: full port abstraction (not just relocating metrics-bound code) so the domain view could
  later enable rules/counts with its own implementations.
- Tasks 1, 3, 4 are structural (Tidy First) — commit separately from behavioral Task 2.
- After Task 4, capability gates (`showRules`, `showCounts`) remain the render switch; the ports
  make the data source per-view.
- Verify per task: `npm test` in visualization; domain e2e (`domainView.e2e.ts`) for Task 2.

## Outcome (2026-08-19)

- The shared feature now imports no view state at all — `EXPLORER_COUNTS` and `EXPLORER_RULES` join
  the existing ports; `SidebarExplorerReadStore`/`WriteStore` are gone.
- Metrics-bound code moved to `views/metricsView/`: counts + rules selectors, the two
  pattern-disabled selectors, `isSearchPatternEmptySelector`, `isPattern`, and the
  `blacklistSearchPattern` effect (now registered via `views/metricsView/effects/metricsView.effects.ts`).
- `provideExplorerSearch` requires a per-view `searchedNodePathsSelector`; the renderModel fallback and
  the now-unused `createSearchedNodePathsSelector` / `createSearchedNodesSelector` factories are gone.
- Row ids are `<scope>:<path>`; the scroll host is resolved through `ExplorerScrollHostService`
  instead of `document.querySelector("#explorer-scroll")`.
- Verified: `npm test` (396 suites green), `tsc`, `npm run lint:architecture`, `npm run format:check`.
  The domain e2e could not be run — Playwright has no browser build for this machine's platform.
