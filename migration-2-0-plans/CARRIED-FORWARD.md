---
name: viz-2.0-carried-forward
issue:
state: living
version: 1
---

# Carried-forward work — Visualization 2.0 migration

> **Read this before scoping ANY new slice.** This is the single canonical list of work that earlier
> slices deliberately deferred. Each slice's own roadmap records *why* it deferred something; this file
> is the forward-looking backlog so a deferred item lands as an explicit task in the slice that unblocks
> it, instead of being lost in a completed slice's outcome notes. When you pick an item up, move it into
> that slice's roadmap DoD and delete the row here.

## Open items

| # | Item | Deferred from | Blocked by / why | Target slice | Unblock condition |
|---|------|---------------|------------------|--------------|-------------------|
| 1 | **`MetricsLensFacade.valueOf(id, metric)`** — per-node metric lookup; completes the facade contract `rangeOf · valueOf · descriptors` | Slice 2 (was a DoD item) | Node ids are assigned only in `NodeDecorator.decorateMapWithMetricData`, inside `accumulatedDataSelector`, which is **downstream** of `metricData`. Since Slice 2 made `metricData` read the metrics-lens facade, a lens→`idToNodeSelector` edge closes a **runtime-breaking module cycle** (`createSelector` gets `undefined` at import). No cycle-free id source exists yet, and nothing consumes `valueOf`. | **Renderer/Page split** slice | `accumulatedData`/`idToNode` ownership is untangled and the cross-renderer node-id scheme is settled, so the lens can expose per-node values without depending on downstream decoration. |
| 2 | **Dependency (edge) lens — remaining.** Slice 3 landed the edge-metric **DATA** core (`lenses/dependency`: `calculateEdgeMetricData`, `edgeMetricData`/`nodeEdgeMetricsMap`/edge-name selectors, `sortedNodeEdgeMetricsMap`), recomposed `metricDataSelector` to a node+edge diamond, and repointed the edge-only data consumers. **Still to move:** (a) the **edge side of `attributeTypes`** — no clean single-lens consumer yet (only the parameterized metricsBar attribute-type label pipeline reads it, serving node+edge); (b) the **injectable `DependencyLensStore`/`EdgesRepo`/facade class** — none built (no injectable edge consumer yet); (c) full **deletion of `metricDataSelector`** — still needed by cross-cutting consumers (`loadInitialFile`, metricsBar/scenario stores, `accumulatedData`) and by the node-only stragglers in item #7. `attributeDescriptors` stays a shared flat map (no split). | Slice 3 (data core done) | (a) needs a genuinely single-lens edge attribute-type reader; (b) needs an injectable edge UI consumer; (c) needs items #3 & #7 to migrate. | **viewState/appearance** + a later edge-UI slice | metricsBar edge UI reads the lens directly; `state/` splits into interaction/appearance/viewState. |
| 2b | **Edge *selection* + the 3 edge effects** (edge *appearance* is now DONE — see Done note). Remaining: `dynamicSettings.edgeMetric` (selection) plus the effects that read/write the edge settings (`updateEdgePreviews`, `updateAmountOfEdgePreviews`, `resetSelectedEdgeMetricWhenItDoesntExistAnymore`). The dependency lens owns edge *data*, not its *selection*. | Slice 3 scope guard | Per-view config, same verdict `colorMetric` got; effects read/write it. | the later **viewState** slice | that module exists. |
| 3 | **Metric *selection*** (`areaMetric`/`heightMetric`/`colorMetric`, `dynamicSettings`) — decide owner (viewState vs metrics lens) and move it. | Slice 2 step 4 | Undecided; defaulted to "per-view config, not metric data". | **viewState** slice | viewState module exists. |
| 4 | **Single-lens metric UI** — re-evaluate moving `metricSelectPopover` (node+edge metric picker) and `metricColorRangeDiagram` (distribution chart) out of the cross-lens `metricsBar` shell into `lenses/metrics/features/`. | Slice 2 step 6 (optional) | Both currently span multiple lenses / live in a shell panel. | when metricsBar/inspector **shell** is split | They become genuinely single-lens. |
| 5 | **Flip the two `warn` dep-cruiser bridges to `error`**: `metrics-lens-ngrx-guard` and `new-must-not-import-legacy`. Slice 4 retired the `showEdges`/`mapColors` lens reads (both now via the appearance facade); the `metrics-lens-ngrx-guard` flip was **deferred** — `legend.service` still injects `Store` for 6 *dynamicSettings/viewState* selector reads (areaMetric/heightMetric/colorMetric/edgeMetric/colorRange/isDeltaState), so moving that injection into a legend `stores/` now would pre-empt the viewState slice. Do the flip when viewState lands (or as a tiny standalone follow-up once a legend store owns those reads). | Slices 1 & 2 (kept at `warn`) | The lens still reads `state/` selectors (blacklist, colorMetric, fileSettings attributes) as documented temporary bridges. | `metrics-lens-ngrx-guard` flip → **viewState** slice (or standalone); the full `new-must-not-import-legacy` flip still needs the interaction + viewState slices | Those modules exist and the lenses no longer import `state/`. |
| 6 | **Structure lens · Terms lens · Renderer/Page split · viewCube move · multi-renderer** | Slice 1 scope guards | Larger future milestones. | their own slices | — |

## Notes
- Items 1–5 are concrete, near-term follow-ups; item 6 is the broad remaining roadmap.
- **Done (2026-07-01):** ~~Slice 4~~ — the `appearance` leaf module is stood up (`slice-4-appearance.md`).
  The ~20 purely-visual settings (mapColors whole, labels, scaling, invert*, hideFlat, whiteBackground, and the
  **edge-appearance** group #2b) moved into `appearance/store/*` behind `appearance.facade`, keeping the
  `appSettings` combineReducers key (code-boundary, not a store-key reshape). The load-time applier moved out of
  `fileStore`; the two lens→`state/` appearance bridges (dependency→showEdges, legend→mapColors) were retired
  via the facade. `new-must-not-import-legacy` warns 24→20. `metrics-lens-ngrx-guard` flip deferred (item #5).
  Next: metric/edge *selection* (viewState, items #3 + #2b-selection) and `interaction`.
- **Done (2026-07-01):** ~~item 7~~ — the three node-only consumers (`resetChosenMetrics.effect`,
  `areAllNecessaryRenderDataAvailable.selector`, `mapReset.store`) now read the metrics-lens
  `nodeMetricDataSelector` directly instead of the `metricDataSelector` aggregator. Value-identical
  swap; the aggregator keeps only its genuinely cross-cutting (node+edge) consumers.
- Item 5 now also covers the **dependency lens's** `new-must-not-import-legacy` bridges (it reads
  `state/` blacklist + showEdges selectors, exactly like the metrics lens reads blacklist + colorMetric).
- Sources: `slice-2-metrics-lens-completion.md` (items 1, 3, 4, 5), `rpi-plan/00-roadmap.md` scope guards
  (items 2, 5, 6), `slice-3-dependency-lens.md` (items 2, 2b).
