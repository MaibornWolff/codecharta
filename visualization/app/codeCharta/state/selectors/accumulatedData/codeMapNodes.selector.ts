import { AccumulatedData, accumulatedDataSelector } from "./accumulatedData.selector"
import { getAllNodes } from "../../../util/codeMapHelper"
import { CodeMapNode } from "../../../codeCharta.model"
import { createSelector } from "@ngrx/store"

export const codeMapNodesSelector = createSelector(
    accumulatedDataSelector,
    (accumulatedData: Pick<AccumulatedData, "unifiedMapNode">): CodeMapNode[] => {
        return getAllNodes(accumulatedData.unifiedMapNode)
    }
)
