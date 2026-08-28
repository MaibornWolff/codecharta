import { createSelector } from "@ngrx/store"
import { CodeMapNode } from "../../../model/codeCharta.model"
import { searchPatternSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { getNodesByGitignorePath } from "../../../util/blacklist/getNodesByGitignorePath"
import { accumulatedDataSelector } from "../accumulatedData/accumulatedData.selector"

export const searchedNodesSelector = createSelector(
    accumulatedDataSelector,
    searchPatternSelector,
    (accumulatedData, searchPattern): CodeMapNode[] => getNodesByGitignorePath(accumulatedData.unifiedMapNode, searchPattern)
)
