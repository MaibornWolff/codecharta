import { createSelector } from "@ngrx/store"
import { hierarchy } from "d3-hierarchy"
import { CodeMapNode } from "../../../model/codeCharta.model"
import { AccumulatedData, accumulatedDataSelector } from "./accumulatedData.selector"

// The mesh's `idToBuilding` keys on the decoration-time ordinal id that accumulatedData's SINGLE
// `decorateMapWithStructure` pass assigns to `unifiedMapNode`, so indexing that SAME tree by id
// resolves the exact building the mesh-highlight consumers (hover / constant-highlight) key on —
// equality by object identity, not merely by the two former structure passes being deterministic.
// This is why id -> node lives HERE, above the lenses, reading the already-decorated tree: it needs
// no clone and no re-run of the (non-idempotent) structure pass. It must never clone or call
// `decorateMapWithStructure` — re-running `mergeFolderChain` would renumber ids and desync from the
// mesh. Twin of `pathToNode.selector.ts` (path-keyed); this one is id-keyed.
export const _calculateIdToNode = (accumulatedData: Pick<AccumulatedData, "unifiedMapNode">): Map<number, CodeMapNode> => {
    if (!accumulatedData.unifiedMapNode) {
        return new Map()
    }

    const idToNode = new Map<number, CodeMapNode>()
    for (const { data } of hierarchy(accumulatedData.unifiedMapNode)) {
        idToNode.set(data.id, data)
    }
    return idToNode
}

export const idToNodeSelector = createSelector(accumulatedDataSelector, _calculateIdToNode)
