import { createSelector } from "@ngrx/store"
import { CodeMapNode } from "../../../model/codeCharta.model"
import { searchPatternSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { getNodesBySearchQuery } from "../../../util/nodeRules/getNodesBySearchQuery"
import { accumulatedDataSelector } from "../accumulatedData/accumulatedData.selector"

export const searchedNodesSelector = createSelector(
    accumulatedDataSelector,
    searchPatternSelector,
    (accumulatedData, searchPattern): CodeMapNode[] => getNodesBySearchQuery(accumulatedData.unifiedMapNode, searchPattern)
)
