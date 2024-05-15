import { createSelector } from "@ngrx/store"
import { hierarchy } from "d3-hierarchy"
import { CodeMapNode } from "../../../codeCharta.model"
import { AccumulatedData, accumulatedDataSelector } from "./accumulatedData.selector"

export const _calculateIdToNode = (accumulatedData: Pick<AccumulatedData, "unifiedMapNode">): Map<number, CodeMapNode> => {
    if (!accumulatedData.unifiedMapNode) {
        return new Map()
    }

    const idToNode: Map<number, CodeMapNode> = new Map([[accumulatedData.unifiedMapNode.id, accumulatedData.unifiedMapNode]])
    for (const { data } of hierarchy(accumulatedData.unifiedMapNode)) {
        idToNode.set(data.id, data)
    }
    return idToNode
}

export const idToNodeSelector = createSelector(accumulatedDataSelector, _calculateIdToNode)
