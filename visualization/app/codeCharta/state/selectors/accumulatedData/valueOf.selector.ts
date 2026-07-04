import { createSelector } from "@ngrx/store"
import { CodeMapNode } from "../../../codeCharta.model"
import { idToNodeSelector } from "../../../lenses/structure/structure.facade"

export type NodeMetricValueLookup = (id: number, metric: string) => number | undefined

/**
 * `valueOf(id, metric)` — the composing layer's per-node metric lookup (Slice 14d, closes CF #1's
 * facade-contract item `rangeOf · valueOf · descriptors`). It resolves a node by id against the
 * decorated tree's `idToNode` map and reads the metric off the node's aggregated attributes.
 *
 * It lives HERE, in the composing layer above the lenses (next to `idToNode`), NOT on the metrics lens:
 * the lookup needs the decoration-time `id -> node` map, and a lens reaching up to it would re-close the
 * exact import cycle CF #1 is about (`lens -> idToNode -> accumulatedData -> lens`). Keeping `valueOf`
 * above the lenses is what makes the per-node lookup cycle-free today. Slice 14e re-expresses it on the
 * metrics lens facade once the renderer-agnostic PATH id keys the lens's own attributes, so a
 * lens-native `valueOf` no longer has to walk the downstream-decorated tree.
 */
export const _valueOf =
    (idToNode: Map<number, CodeMapNode>): NodeMetricValueLookup =>
    (id, metric) =>
        idToNode.get(id)?.attributes?.[metric]

export const valueOfSelector = createSelector(idToNodeSelector, _valueOf)
