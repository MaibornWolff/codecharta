import { createSelector, MemoizedSelector } from "@ngrx/store"
import { CcState, CodeMapNode } from "../../../model/codeCharta.model"
import { searchPatternSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { getNodesByGitignorePath } from "../../../util/blacklist/getNodesByGitignorePath"
import { accumulatedDataSelector } from "../accumulatedData/accumulatedData.selector"

export const createSearchedNodesSelector = (patternSelector: MemoizedSelector<CcState, string>) =>
    createSelector(accumulatedDataSelector, patternSelector, (accumulatedData, searchPattern): CodeMapNode[] =>
        getNodesByGitignorePath(accumulatedData.unifiedMapNode, searchPattern)
    )

export const searchedNodesSelector = createSearchedNodesSelector(searchPatternSelector)
