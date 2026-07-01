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
| 2b | **Edge *selection* + edge appearance + the 3 edge effects** — `dynamicSettings.edgeMetric` (selection) and the edge appSettings (`isEdgeMetricVisible`, `amountOfEdgePreviews`, `edgeHeight`, `showIncoming/OutgoingEdges`, `showOnlyBuildingsWithEdges`; `mapColors` stays a whole shared map), plus the effects that read/write them (`updateEdgePreviews`, `updateAmountOfEdgePreviews`, `resetSelectedEdgeMetricWhenItDoesntExistAnymore`). The dependency lens owns edge *data*, not its *selection*/*appearance*. | Slice 3 scope guard | Per-view config/appearance, same verdict `colorMetric` got; effects read/write it. | **edge *appearance* → `slice-4-appearance.md`** (drafted); edge *selection* + 3 effects → the later **viewState** slice | those modules exist. |
| 3 | **Metric *selection*** (`areaMetric`/`heightMetric`/`colorMetric`, `dynamicSettings`) — decide owner (viewState vs metrics lens) and move it. | Slice 2 step 4 | Undecided; defaulted to "per-view config, not metric data". | **viewState** slice | viewState module exists. |
| 4 | **Single-lens metric UI** — re-evaluate moving `metricSelectPopover` (node+edge metric picker) and `metricColorRangeDiagram` (distribution chart) out of the cross-lens `metricsBar` shell into `lenses/metrics/features/`. | Slice 2 step 6 (optional) | Both currently span multiple lenses / live in a shell panel. | when metricsBar/inspector **shell** is split | They become genuinely single-lens. |
| 5 | **Flip the two `warn` dep-cruiser bridges to `error`**: `metrics-lens-ngrx-guard` and `new-must-not-import-legacy`. | Slices 1 & 2 (kept at `warn`) | The lens still reads `state/` selectors (blacklist, colorMetric, fileSettings attributes) as documented temporary bridges. | **partially in `slice-4-appearance.md`** (drafted): the single-edge `metrics-lens-ngrx-guard` flip + retiring the `showEdges`/`mapColors` lens reads; the full `new-must-not-import-legacy` flip still needs the interaction + viewState slices | Those modules exist and the lenses no longer import `state/`. |
| 6 | **Structure lens · Terms lens · Renderer/Page split · viewCube move · multi-renderer** | Slice 1 scope guards | Larger future milestones. | their own slices | — |

## Notes
- Items 1–5 are concrete, near-term follow-ups; item 6 is the broad remaining roadmap.
- **Next slice drafted:** `slice-4-appearance.md` — stands up the `appearance` leaf module (the cleanest
  first cut of the `state/` split), delivering item #2b edge-appearance and partially advancing #5. Metric/
  edge *selection* (viewState, items #3 + #2b-selection) and `interaction` are the following two slices.
- **Done (2026-07-01):** ~~item 7~~ — the three node-only consumers (`resetChosenMetrics.effect`,
  `areAllNecessaryRenderDataAvailable.selector`, `mapReset.store`) now read the metrics-lens
  `nodeMetricDataSelector` directly instead of the `metricDataSelector` aggregator. Value-identical
  swap; the aggregator keeps only its genuinely cross-cutting (node+edge) consumers.
- Item 5 now also covers the **dependency lens's** `new-must-not-import-legacy` bridges (it reads
  `state/` blacklist + showEdges selectors, exactly like the metrics lens reads blacklist + colorMetric).
- Sources: `slice-2-metrics-lens-completion.md` (items 1, 3, 4, 5), `rpi-plan/00-roadmap.md` scope guards
  (items 2, 5, 6), `slice-3-dependency-lens.md` (items 2, 2b).
