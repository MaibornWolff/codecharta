---
name: blacklist-performance-fix
issue: ""
state: complete
version: <next>
date: 2026-05-05
git_commit: 724a7a0cea3c7ac5b3f345114ff668933c1ce77d
branch: main
topic: "Cache ignore-engines per blacklist mutation to fix flatten/exclude stalls"
tags: [plan, visualization, performance, blacklist, sidebar-explorer]
---

# Cache ignore-engines per blacklist mutation

Companion to `2026-05-05-blacklist-performance-analysis.md`.

## Goal

Adding or removing a flatten/exclude rule on a large codebase currently burns
hundreds of thousands of `ignore`-engine builds and regex compiles before the
3D rebuild even starts. Build the engines **once per blacklist mutation** and
reuse them across every selector / pure helper that checks paths.

Target: <50ms of selector work per add/remove on a ~10k-leaf map with ~20
rules, before the 3D rebuild begins.

## Overview

1. Introduce a memoized `blacklistMatcherSelector` that derives a small
   `BlacklistMatcher` value object (two pre-built `ignore` engines wrapped in
   `isExcluded(path)` / `isFlattened(path)`) from `blacklistSelector`.
2. Swap the per-call `isPathBlacklisted(path, blacklist, type)` usage in the
   five hot callers for `matcher.isExcluded(path)` /
   `matcher.isFlattened(path)`.
3. Apply the same "build engines once per mutation" pattern to the two hot
   callers that need *per-rule* engines: `buildRulesWithCount` (sidebar
   explorer counts) and `NodeDecorator.decorateMap` (accumulated data).
4. Keep `isPathBlacklisted` and `isNodeExcludedOrFlattened` as-is for cold
   single-shot callers (one remaining: `codeMap.mouseEvent.service.ts`).

`BlacklistMatcher` is the thin abstraction we thread through pure helpers:

```ts
// new in app/codeCharta/util/codeMapHelper.ts
export interface BlacklistMatcher {
    isExcluded(path: string): boolean
    isFlattened(path: string): boolean
}

export function createBlacklistMatcher(blacklist: BlacklistItem[]): BlacklistMatcher {
    const flatten = ignore()
    const exclude = ignore()
    for (const entry of blacklist) {
        const transformed = transformPath(entry.path)
        if (entry.type === "flatten") flatten.add(transformed)
        else exclude.add(transformed)
    }
    return {
        isExcluded: path => exclude.ignores(transformPath(path)),
        isFlattened: path => flatten.ignores(transformPath(path))
    }
}
```

`blacklistMatcherSelector` lives next to `blacklistByType.selector.ts`:

```ts
// app/codeCharta/state/store/fileSettings/blacklist/blacklistMatcher.selector.ts
export const blacklistMatcherSelector = createSelector(blacklistSelector, createBlacklistMatcher)
```

## Affected files

```
visualization/app/codeCharta/
├── util/
│   └── codeMapHelper.ts                                           [+] BlacklistMatcher, createBlacklistMatcher
├── state/store/fileSettings/blacklist/
│   └── blacklistMatcher.selector.ts                               [new] memoized matcher selector
├── state/selectors/accumulatedData/
│   ├── accumulatedData.selector.ts                                [~] read matcher, pass through
│   └── metricData/
│       ├── metricData.selector.ts                                 [~] read matcher, pass through
│       ├── nodeMetricData.calculator.ts                           [~] take matcher arg
│       └── edgeMetricData.calculator.ts                           [~] take matcher arg
├── state/effects/addBlacklistItemsIfNotResultsInEmptyMap/
│   ├── addBlacklistItemsIfNotResultsInEmptyMap.effect.ts          [~] build temp matcher for trial blacklist
│   └── resultsInEmptyMap.ts                                       [~] take matcher arg
├── features/sidebarExplorer/selectors/
│   └── sidebarExplorer.selectors.ts                               [~] matcher for counts; per-rule engines for buildRulesWithCount
├── util/
│   └── nodeDecorator.ts                                           [~] per-rule engines for decorateMap
└── util/algorithm/streetLayout/
    └── streetLayoutGenerator.ts                                   [~] take matcher arg, propagate through createBoxes
```

## Phase 1 — Shared `BlacklistMatcher`, swap five hot call sites

Drops `2L × B + L × B + 2·edges × B + traversal × B` engine builds per
mutation to **two** single-pass builds (one for flatten, one for exclude).
Expected to deliver ~80% of the win.

### 1.1 Add `BlacklistMatcher` + factory in `codeMapHelper.ts`

- Export `BlacklistMatcher` interface and `createBlacklistMatcher(blacklist)` as
  shown in the Overview. Leave the existing `isPathBlacklisted` and
  `isPathHiddenOrExcluded` untouched — `mouseEvent.service.ts` keeps using
  them.

### 1.2 Add `blacklistMatcherSelector`

- New file
  `state/store/fileSettings/blacklist/blacklistMatcher.selector.ts`.
- One-liner: `createSelector(blacklistSelector, createBlacklistMatcher)`.

### 1.3 Swap call sites to consume the matcher

For each, change the function signature from `(…, blacklist: BlacklistItem[])`
to `(…, matcher: BlacklistMatcher)` and replace
`isPathBlacklisted(path, blacklist, "exclude" | "flatten")` with
`matcher.isExcluded(path)` / `matcher.isFlattened(path)`. Update the parent
selector to pass the matcher through.

- `state/selectors/accumulatedData/metricData/nodeMetricData.calculator.ts` →
  `calculateNodeMetricData(visibleFileStates, matcher)`.
- `state/selectors/accumulatedData/metricData/edgeMetricData.calculator.ts` →
  `calculateEdgeMetricData(visibleFileStates, matcher)` and
  `bothNodesAssociatedAreVisible(edge, filePaths, matcher)`.
- `state/selectors/accumulatedData/metricData/metricData.selector.ts` →
  swap `blacklistSelector` for `blacklistMatcherSelector`, forward to both
  calculators.
- `features/sidebarExplorer/selectors/sidebarExplorer.selectors.ts` →
  `_calculateExplorerCounts(searchedNodes, matcher, allLeaves)` and
  `countLeavesMatching(leaves, matcher, type)`. `explorerCountsSelector`
  reads `blacklistMatcherSelector` instead of `blacklistSelector`.
  *(buildRulesWithCount stays in Phase 2.)*
- `util/algorithm/streetLayout/streetLayoutGenerator.ts` →
  `createStreetLayoutNodes(map, state, metricData, matcher, isDeltaState)`,
  thread `matcher` through `createBoxes`. Sole caller is
  `ui/codeMap/codeMap.render.service.ts:98` (`CodeMapRenderService.getNodes`,
  a component service — not an effect — that already calls
  `metricDataSelector(state)`). Read the matcher the same way:
  `blacklistMatcherSelector(state)` and pass it as the new arg.
- `state/effects/addBlacklistItemsIfNotResultsInEmptyMap/resultsInEmptyMap.ts`
  → `resultsInEmptyMap(visibleFiles, matcher)`. The trial blacklist is the
  *combined* one (current + new items), so the effect builds a fresh matcher
  inline: `createBlacklistMatcher([...currentBlacklist, ...action.items])`.
  Still O(B+extra) instead of O(N×B).

### 1.4 Keep `accumulatedDataSelector` consistent

- `accumulatedData.selector.ts` currently passes `blacklist` into
  `NodeDecorator.decorateMap`. Phase 2 changes that signature; Phase 1 leaves
  the selector untouched (still reading `blacklistSelector`).

## Phase 2 — Per-rule engines for `buildRulesWithCount` and `NodeDecorator.decorateMap`

Drops `R × L` and `B × N` engine builds to `R` and `B` per mutation
respectively. Same idea as Phase 1, but the call sites need *one engine per
rule* (not one combined engine), so they build a small array of per-rule
engines once and iterate nodes.

### 2.1 `sidebarExplorer.selectors.ts → buildRulesWithCount`

- For each rule of the requested type, build `ignore().add(transformPath(item.path))` once.
- Then `affectedCount = allLeaves.reduce((c, n) => c + (engine.ignores(transformPath(n.path)) ? 1 : 0), 0)`.
- `flatten/excludeRulesWithCountSelector` continue to memoize on
  `(blacklist, allLeaves)` — no change to the selector inputs.

### 2.2 `util/nodeDecorator.ts → decorateMap`

- `decorateMap` calls `isNodeExcludedOrFlattened(data, item.path)` per
  `(node × item)`. Each call invokes `returnIgnore(item.path)` which builds an
  engine and parses the (comma-split, wildcard-padded, `!`-prefixed) pattern
  every time.
- Refactor: pre-compute one `{ ignoredNodePaths, condition }` per blacklist
  item once, before the `hierarchy(map)` loop. Reuse `returnIgnore` for the
  build, only call it per item, not per `(node × item)`.
- Semantics of `returnIgnore` (negation, wildcards) must be preserved — do
  *not* try to merge per-rule engines into one combined engine here. The
  `condition` flag is per-rule.

### 2.3 (Optional, if it stays cheap) Avoid repeated `transformPath(node.path)` in inner loops

- Phase 1 + Phase 2 will already be fast enough on the perf target. Only do
  this if profile after Phase 1+2 still shows `transformPath` non-negligible.
  Compute once per node into a local var inside the leaf loop.

## Phase 3 — *Conditional.* `Set<string>` of blacklisted leaf paths for `streetLayoutGenerator`

Only execute if profiling on a 10k-leaf map after Phase 1 still shows
`createBoxes` as a hot frame.

### 3.1 New selector

- `flattenedLeafPathsSelector`, `excludedLeafPathsSelector` — both
  `createSelector(codeMapNodesSelector, blacklistMatcherSelector, ...)` →
  `Set<string>` of leaf paths matching the engine.

### 3.2 Switch `streetLayoutGenerator.createBoxes`

- Replace `matcher.isExcluded(child.path)` with `excludedSet.has(child.path)`.
  O(1) lookup, no `transformPath` per check.
- Thread the set in alongside (or replacing) the matcher in the layout
  caller.

## Out of scope

- Mesh / geometry rebuild cost (separate axis, separate plan).
- Replacing the `ignore` library — it's the right tool, just called wrong.
- The cold caller `ui/codeMap/codeMap.mouseEvent.service.ts:167`
  (`isPathHiddenOrExcluded`, single-path on click). Leave as-is.

## Verification

### Automated

- [x] New unit spec
  `state/store/fileSettings/blacklist/blacklistMatcher.selector.spec.ts`
  asserts that:
   - the selector returns the same matcher reference across two reads with a
     reference-equal blacklist;
   - the returned matcher answers `isExcluded` / `isFlattened` correctly for
     a small fixture covering an exact path, a glob pattern, and a non-match.
- [x] Existing affected specs stay green after signature changes:
  `nodeMetricData.calculator.spec.ts`, `edgeMetricData.calculator.spec.ts`,
  `sidebarExplorer.selectors.spec.ts`, `nodeDecorator.spec.ts`,
  `addBlacklistItemsIfNotResultsInEmptyMap.effect.spec.ts`,
  `streetLayoutGenerator.spec.ts`.
- [x] `cd visualization && npx jest --maxWorkers=2 --coverage=false --testPathPatterns='(blacklist|metric|sidebarExplorer|streetLayout|nodeDecorator|codeMapHelper|accumulatedData|codeMap\.(render|mouseEvent))'` → 492 tests across 94 suites pass.
- [ ] `cd visualization && npm run e2e` — blocked in this sandbox (Chromium not installed). User to run on host.

### Manual

- [ ] Load `sample1.cc.json` (or the largest available sample), confirm
  ~10k leaves. Open DevTools Performance, mark `setBlacklist` user-timing
  spans. Add 20 rules in sequence. Each add: selector chain settles in
  <50ms before the 3D rebuild begins.
- [ ] Visually verify counts in `<cc-sidebar-explorer>` (`SHOWN /
  FLATTENED / HIDDEN`) and per-rule counts in the rules popover are
  unchanged vs. `main`.

## Steps

- [x] Phase 1.1 — Add `BlacklistMatcher` + `createBlacklistMatcher` to `codeMapHelper.ts`.
- [x] Phase 1.2 — Add `blacklistMatcherSelector`.
- [x] Phase 1.3a — Swap `nodeMetricData.calculator.ts` + parent selector.
- [x] Phase 1.3b — Swap `edgeMetricData.calculator.ts` + parent selector.
- [x] Phase 1.3c — Swap `_calculateExplorerCounts` (sidebarExplorer.selectors).
- [x] Phase 1.3d — Swap `streetLayoutGenerator.createBoxes` + caller.
- [x] Phase 1.3e — Swap `resultsInEmptyMap` + effect to build trial matcher.
- [x] Phase 1 — Run unit tests; fix any signature fallout.
- [x] Phase 2.1 — Per-rule engines in `buildRulesWithCount`.
- [x] Phase 2.2 — Per-rule engines in `NodeDecorator.decorateMap`.
- [x] Phase 2 — Run unit tests.
- [x] Verification — Add `blacklistMatcher.selector.spec.ts` (ref-equality + correctness).
- [x] Verification — Run full `npm test` (492 tests across 94 suites, all green for blacklist|metric|sidebarExplorer|streetLayout|nodeDecorator|codeMapHelper|accumulatedData|codeMap.(render|mouseEvent)). `npm run e2e` blocked locally — Chromium not available in this sandbox. User needs to run e2e on host.
- [ ] Verification — Manual perf check on 10k-leaf map (<50ms per add).
- [ ] Phase 3 — *Only if* manual perf check still flags `streetLayoutGenerator`: add `excludedLeafPathsSelector` (+ flatten variant), switch `createBoxes` to `Set.has`.

## Notes

- `BlacklistMatcher` is intentionally tiny so it can be replaced by the
  Phase 3 `Set<string>` shape later without churning every signature.
- The `ignore` library's `Ignore.ignores(path)` is a pure query — engines
  are safe to share across selectors and across calls.
- `createSelector` reference-equality on `blacklistSelector` guarantees a
  stable `BlacklistMatcher` reference until the blacklist actually
  changes; downstream selectors (`metricDataSelector`,
  `accumulatedDataSelector`, `explorerCountsSelector`) become memoization
  cache hits when *only* unrelated state slices update.
- `resultsInEmptyMap` uses a *trial* blacklist (current + new items), so
  the effect cannot reuse `blacklistMatcherSelector` — it must build a
  one-off matcher inline. That's still O(B+extra) instead of O(N×B), so
  the effect path becomes ~constant time in `N`.
- Companion analysis with cost tables and call-site inventory:
  `plans/2026-05-05-blacklist-performance-analysis.md`.
