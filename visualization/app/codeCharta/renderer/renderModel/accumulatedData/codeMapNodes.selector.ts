import { createSelector } from "@ngrx/store"
import { CodeMapNode } from "../../../model/codeCharta.model"
import { getAllNodes } from "../../../util/codeMapHelper"
import { AccumulatedData, accumulatedDataSelector } from "./accumulatedData.selector"

export const codeMapNodesSelector = createSelector(
    accumulatedDataSelector,
    (accumulatedData: Pick<AccumulatedData, "unifiedMapNode">): CodeMapNode[] => {
        return getAllNodes(accumulatedData.unifiedMapNode)
    }
)
