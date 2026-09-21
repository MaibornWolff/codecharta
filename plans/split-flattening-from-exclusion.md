---
name: split-flattening-from-exclusion
issue: <none>
state: complete
version: unreleased
---

# Split flattening from exclusion

## Context

Flattening a node only makes a subtree short and grey. It changes no node's existence and no
footprint. Yet measured on a 50k-node map it costs the same as excluding: **flatten 3.2 s, exclude
3.1 s**, indistinguishable.

Both are stored as one `BlacklistItem { path, type: "flatten" | "exclude" }` in one slice,
`sharedView.blacklist`. `blacklistSelector` is an input to `accumulatedDataSelector`
(`renderer/renderModel/accumulatedData/accumulatedData.selector.ts:22-45`), so *any* change to it
re-runs `clone(structureTree)` over every node, `NodeDecorator.decorateMap`,
`addEdgeMetricsForLeaves` and `decorateParentNodesWithAggregatedAttributes`, then emits a new
`unifiedMapNode` and forces a full layout and mesh rebuild.

Flatness is already computed at layout time for its other two sources — a non-searched node and a
node with no visible edges (`treeMapHelper.ts:171-186`). Only the blacklist source is baked in
upstream. This moves it to where the other two already are.

The vocabulary goes with it. Today "blacklist" means exclude-only, flatten-only or both depending on
the file; the UI says "Hidden" for what the code calls **exclude**; and cc.json says `hide` for what
the code calls **flatten** — the exact opposite. That is a three-way collision, and it is why the
two concepts were never separated.

Target outcome: flattening costs what an area-metric change costs, and every name means one thing.

## Tasks

### 1. Split the state structurally

- `sharedView.blacklist: BlacklistItem[]` → two slices: `sharedView.excludedNodes: ExcludedNode[]`
  and `sharedView.flattenedNodes: FlattenedNode[]` (`model/state.model.ts:66`,
  `model/domain.model.ts:223-229`).
- Two slices rather than one filtered array **on purpose**: each keeps its own stable array
  reference, so downstream memoisation holds for free. A derived `createSelector(blacklistSelector,
  filterByType)` would return a fresh array on every change and defeat the whole exercise.
- Split the actions and reducer in `stores/sharedView/store/blacklist/` accordingly; `clearRulesOfType`
  (`rules.actions.ts:8`) already keys on the type and drives two slices, so it fits.
- Metric rules keep one slice. They carry the same type union (`domain.model.ts:246`) but have a
  shared editor UI, so splitting the slice would buy little. Derive
  `flattenMetricRulesSelector` / `excludeMetricRulesSelector` with
  `createSelectorFactory(projection => defaultMemoize(projection, comparer, comparer))` and an
  element-wise `===` comparer — the precedent is `stores/fileStore/store/visibleFileStates.selector.ts:57-58`.

### 2. Repoint the exclude-only consumers

`matcher.isFlattened` has **no caller** outside `blacklistMatcher.ts:71`. Every consumer of
`blacklistMatcherSelector` is exclude-only yet recomputes on any flatten change because the matcher
identity changes. Point each at an exclude-only matcher:
`renderer/renderModel/nodeMetricData/nodeMetricData.selector.ts:10`,
`renderer/renderModel/edgeMetricData/edgeMetricData.selector.ts:7`,
`.../sortedNodeEdgeMetricsMap.selector.ts:12`, `features/codeMap/codeMap.render.service.ts:140`.

### 3. Move flattening to layout time

- `accumulatedDataSelector`: inputs become `excludedNodesSelector` and `excludeMetricRulesSelector`.
- `util/nodeDecorator.ts:39-49`: `decorateMap` writes `isExcluded` only; the `isFlattened` write goes.
  Drop `CodeMapNode.isFlattened` (`domain.model.ts:49`) once nothing reads it.
- New `renderer/renderModel/flatness/flattenPredicate.selector.ts`, exported through
  `renderModel.facade.ts`: composes the flatten path matcher with the flatten metric rules (metric
  half applies to leaves only, as `nodeDecorator.ts:45` does today).
- `treeMapHelper.ts:171-186`: replace `if (codeMapNode.isFlattened)` with the predicate, keeping it
  first so precedence (rules → search → edges) is unchanged. `isNodeFlat` already takes the whole
  `state` and already calls `searchedNodePathsSelector` and `edgesSelector`, so this is the
  established pattern, not a new one. `treeMapHelper.ts` already imports `renderModel.facade`, and
  `renderer/` importing `stores/` respects the dependency-cruiser rules. Street layout is covered
  through the same helper (`streetViewHelper.ts:37`).

### 4. Rewire the render trigger — without this, flattening does nothing

`actionsRequiringRerender.ts` contains **zero** blacklist actions (verified). Today a flatten
re-renders only as a side effect of `accumulatedData` emitting. The moment flatten stops invalidating
that selector, nothing redraws.

Add the node-rule and metric-rule actions to `actionsRequiringRerender` and map them in
`renderInvalidation.ts`: flatten actions → `{ geometry: true }`, exclude actions → left unmapped so
they fall through to `FULL_INVALIDATION`. Safety net already in place: `consumeInvalidation`
(`renderCodeMap.effect.ts`) forces a full invalidation whenever the map node reference changed, so
`{geometry}` cannot under-invalidate a mixed action.

### 5. Keep the explorer honest

`lenses/explorerRow/store/explorerRow.projection.ts:37` and
`views/metricsView/explorer/explorerCounts.selector.ts:15,21` read `node.isFlattened` and go
silently wrong the moment the decorator stops writing it. A lens must not read view state, so widen
the input instead: `ExplorerRowInputs.showsFlattenedState` → an `isFlattened?: (node) => boolean`
predicate supplied by `views/metricsView/explorer/metricsExplorerRow.ts`, and feed
`explorerCounts.selector.ts` from the same predicate.

Fold the duplicated matching engine at `views/metricsView/explorer/explorerRules.selectors.ts:42-52`
onto the shared matcher in the same pass — its comment claims it mirrors `NodeDecorator`, which this
change makes untrue.

### 6. Rename, and the migrations it forces

| now | becomes |
| --- | --- |
| `BlacklistItem` / `BlacklistType` | `ExcludedNode` / `FlattenedNode` |
| `sharedView.blacklist` | `sharedView.excludedNodes` + `sharedView.flattenedNodes` |
| `util/blacklist/` | `util/exclusion/` + `util/flattening/` |
| `isPathHiddenOrExcluded` | split into `isExcluded` / `isFlattened` |
| `blacklistExclusionGuard.ts` | `excludeGuard.ts` (already exclude-only) |
| `features/fileExtensionBar/stores/blackListExtension.store.ts` | `flattenExtension.store.ts` (already flatten-only) |
| UI "Hidden Rules" / `explorer-hidden-*` ids | "Excluded" / `explorer-excluded-*` |
| `ExplorerCounts.hidden` | `.excluded` |

"Blacklist" and "hide" survive **only** inside the cc.json 1.x wire DTO, where they are the file
format. The translation stays at exactly two points, unchanged in meaning:
`stores/fileStore/loaders/ccJson/util/ccJson2/normalizeToCcJson2.ts:77-81` and
`stores/fileStore/loaders/ccJson/util/fileParser.ts:27-33`.

Two stored shapes change, so two migrations are mandatory:
- IndexedDB: `DB_VERSION` 22 → 23 plus a `CCSTATE_RECORD_MIGRATIONS` v22 entry splitting
  `sharedView.blacklist` into the two arrays (`stores/rootStore/indexedDB/indexedDBWriter.ts:15,599`).
- Scenarios: `SCENARIO_SCHEMA_VERSION` 2 → 3 (`features/scenarios/model/scenario.model.ts:22`) plus a
  v2→v3 step in `scenarioMigration.ts`. Note `scenarioMigration.ts:74` currently accepts only
  `1 || CURRENT`; that accept-list has to widen or every existing scenario is rejected.

## Steps

- [x] Complete Task 1: Split the state structurally
- [x] Complete Task 2: Repoint the exclude-only consumers
- [x] Complete Task 3: Move flattening to layout time
- [x] Complete Task 4: Rewire the render trigger
- [x] Complete Task 5: Keep the explorer honest
- [x] Complete Task 6: Rename, and the migrations it forces

## Verification

- **Regression guard, written first**: after a flatten action, assert
  `accumulatedDataSelector(state).unifiedMapNode` is the *same reference* as before. Fails today,
  passes after Task 3. Same shape for `nodeMetricDataSelector` and `edgeMetricDataSelector`.
- **Unit**: flatten precedence (rule → search → edges) unchanged; `hideFlatBuildings` on and off;
  explorer counts and row state with the new predicate; the IndexedDB and scenario migrations both
  directions.
- **e2e**: flattening greys a subtree and leaves the footprint alone; excluding still removes it;
  clearing rules restores both.
- **Measured, in the browser, on the 50k map**: the flatten and exclude timings must diverge. Method:
  two `performance.now()` calls around `CodeMapRenderService.load` in a throwaway build, `git stash`
  for the baseline. Do **not** use long-task totals — under SwiftShader a single frame costs ~780 ms
  and swamps the signal.
- **Round trip**: a v1 cc.json carrying `"hide"`, a `.ccscenario` written by the current build, and an
  IndexedDB record written by the current build must all still load.
- Full gate before commit: `npm run format:check`, `npm test`, `npm run lint`, `npx tsc --noEmit`,
  `npm run e2e:ci`.

## Outcome

Measured on the 50,101-node map, timing the `clone + decorateMap + aggregate` pass directly:

| action | before | after |
| --- | --- | --- |
| flatten a folder | runs the pass, 54 ms | **does not run it at all** |
| exclude a folder | runs the pass, 54 ms | runs it, 54 ms (correct: the node set changed) |

Flattening also stopped raising the loading spinner, because it no longer goes through
`dispatchAfterPaint`.

**The headline number in the Context above was wrong, and the plan was sized against it.** The
3.2 s / 3.1 s figures are wall clock under SwiftShader, where one frame of 50k instanced boxes costs
~800 ms; the pipeline itself was ~160 ms and the decorate pass 54 ms of that. So this change removes
54 ms and a spinner from a flatten — real, but a fraction of what the plan implied. A flatten still
re-runs the layout and rebuilds the mesh (~160 ms), which is the remaining cost and was never in
this plan's scope.

## Notes

- **Expected win, stated honestly**: this removes the clone + decorate + aggregate pass, which is the
  dominant cost. It does **not** reach the ~115 ms of an area-metric change, because
  `sortVisibleNodesByHeightDescending` (`codeMap.render.service.ts`) sorts by height — flattening
  drops nodes to the minimum height, the order permutes, and `CodeMapMesh.canUpdateInPlace` (which
  compares `node.path` per index) fails, so a new mesh is built. Closing that last gap needs a stable
  instance order and is deliberately **not** in this plan: `geometryGenerator.update` rebinds
  building-at-index to node, so hover, selection and raycast results would have to tolerate the
  permutation. Measure first, then decide.
- Risky spots to check explicitly: search-pattern flattening (a second flatness source through the
  same predicate), `hideFlatBuildings` (feeds `isVisible`, so it *can* change the node set and must
  keep forcing a full invalidation), the file-extension bar (its store is flatten-only today), and
  delta mode (`getBuildingColor` returns `mapColors.base` before the flat check).
- **Deviation from the approved naming**: one shape, `NodeRule { path, nodeType? }`, with
  `ExcludedNode` and `FlattenedNode` as named aliases, rather than two identical interfaces —
  TypeScript is structural, so two separate interfaces would give no extra safety. The `type`
  discriminator is gone from the entries entirely: the list an entry sits in now says what it does.
- The two matchers live in one `util/nodeRules/` directory rather than two, because they share the
  gitignore engine (`gitignorePattern.ts`) and splitting the directory would have duplicated it.
- Metric rules keep one slice with a `type` discriminator (they are edited as one list); the two
  effects are derived with a stable-identity selector, the precedent being
  `visibleFileStates.selector.ts:57`.
