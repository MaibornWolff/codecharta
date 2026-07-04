import { createSelector } from "@ngrx/store"
import { CodeMapNode } from "../../../codeCharta.model"
import { idToNodeSelector } from "../../structure/structure.facade"

export type NodeMetricValueLookup = (id: number, metric: string) => number | undefined

/**
 * `valueOf(id, metric)` — the metrics lens's per-node metric lookup (Slice 14e-3, closes CF #1's
 * facade-contract item `rangeOf · valueOf · descriptors`). It resolves a node by id through the
 * STRUCTURE lens's `idToNode` (a legal lens -> lens facade import, `lens-cross-lens-only-via-facade`)
 * and reads the metric off the node's attributes.
 *
 * It lives on the metrics lens — metric value access is a metrics-lens concern — and is cycle-free
 * because it depends only DOWNWARD on the structure lens's own tree resolution, never on the composing
 * layer: `render-model-is-top-derived-layer` (error) forbids any lens -> renderModel/ edge, so neither
 * this selector nor the structure lens's idToNode can reach `accumulatedData` (which lives in
 * renderModel/ since Slice 15) — exactly the cycle CF #1 was
 * about (`lens -> idToNode -> accumulatedData -> metricsLens.facade -> lens`). Slice 14d first made the
 * lookup cycle-free by parking it above the lenses; 14e-3 re-expresses it ON the lens now that the
 * structure lens owns a decoration-independent `id -> node` map.
 */
export const _valueOf =
    (idToNode: Map<number, CodeMapNode>): NodeMetricValueLookup =>
    (id, metric) =>
        idToNode.get(id)?.attributes?.[metric]

export const valueOfSelector = createSelector(idToNodeSelector, _valueOf)
