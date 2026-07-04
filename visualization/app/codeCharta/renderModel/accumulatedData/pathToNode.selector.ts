import { createSelector } from "@ngrx/store"
import { hierarchy } from "d3-hierarchy"
import { CodeMapNode } from "../../codeCharta.model"
import { AccumulatedData, accumulatedDataSelector } from "./accumulatedData.selector"

// The renderer-agnostic selected/hovered/right-clicked ids are canonical node PATHs (Slice 14e-2), so
// resolving one back to its CodeMapNode keys on `path` — stable across re-decoration/blacklist/reload —
// rather than the decoration-time ordinal that `idToNodeSelector` still serves the mesh-highlight paths.
export const _calculatePathToNode = (accumulatedData: Pick<AccumulatedData, "unifiedMapNode">): Map<string, CodeMapNode> => {
    if (!accumulatedData.unifiedMapNode) {
        return new Map()
    }

    const pathToNode: Map<string, CodeMapNode> = new Map()
    for (const { data } of hierarchy(accumulatedData.unifiedMapNode)) {
        pathToNode.set(data.path, data)
    }
    return pathToNode
}

export const pathToNodeSelector = createSelector(accumulatedDataSelector, _calculatePathToNode)
