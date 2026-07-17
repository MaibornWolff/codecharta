import { createSelector } from "@ngrx/store"
import { searchPatternSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { getNodesByGitignorePath } from "../../../util/blacklist/getNodesByGitignorePath"
import { accumulatedDataSelector } from "../accumulatedData/accumulatedData.selector"

export const searchedNodesSelector = createSelector(accumulatedDataSelector, searchPatternSelector, (accumulatedData, searchPattern) =>
    getNodesByGitignorePath(accumulatedData.unifiedMapNode, searchPattern)
)
