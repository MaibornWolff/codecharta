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
| 2 | **Dependency (edge) lens** — move `calculateEdgeMetricData`, `metricNamesSelector` (edge names), `sortedNodeEdgeMetricsMap`, and the **edge side** of `attributeTypes`/`attributeDescriptors` out of `state/`; shrink `metricDataSelector` to nothing once its edge/cross-cutting consumers migrate. | Slices 1 & 2 (node side only) | Not started; edges intentionally left in place. | **Dependency lens** slice | — |
| 3 | **Metric *selection*** (`areaMetric`/`heightMetric`/`colorMetric`, `dynamicSettings`) — decide owner (viewState vs metrics lens) and move it. | Slice 2 step 4 | Undecided; defaulted to "per-view config, not metric data". | **viewState** slice | viewState module exists. |
| 4 | **Single-lens metric UI** — re-evaluate moving `metricSelectPopover` (node+edge metric picker) and `metricColorRangeDiagram` (distribution chart) out of the cross-lens `metricsBar` shell into `lenses/metrics/features/`. | Slice 2 step 6 (optional) | Both currently span multiple lenses / live in a shell panel. | when metricsBar/inspector **shell** is split | They become genuinely single-lens. |
| 5 | **Flip the two `warn` dep-cruiser bridges to `error`**: `metrics-lens-ngrx-guard` and `new-must-not-import-legacy`. | Slices 1 & 2 (kept at `warn`) | The lens still reads `state/` selectors (blacklist, colorMetric, fileSettings attributes) as documented temporary bridges. | when `state/` becomes **`interaction`/`appearance`/`viewState`** | Those modules exist and the lens no longer imports `state/`. |
| 6 | **Structure lens · Terms lens · Renderer/Page split · viewCube move · multi-renderer** | Slice 1 scope guards | Larger future milestones. | their own slices | — |

## Notes
- Items 1–5 are concrete, near-term follow-ups; item 6 is the broad remaining roadmap.
- Sources: `slice-2-metrics-lens-completion.md` (items 1, 3, 4, 5), `rpi-plan/00-roadmap.md` scope guards
  (items 2, 5, 6).
