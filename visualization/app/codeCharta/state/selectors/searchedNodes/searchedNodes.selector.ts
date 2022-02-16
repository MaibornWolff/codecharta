import { createSelector } from "../../angular-redux/store"
import { getNodesByGitignorePath } from "./getNodesByGitignorePath"
import { unifiedMapNodeSelector } from "../accumulatedData/unifiedMapNode.selector"
import { searchPatternSelector } from "../../store/dynamicSettings/searchPattern/searchPattern.selector"

export const searchedNodesSelector = createSelector([unifiedMapNodeSelector, searchPatternSelector], (unifiedMapNode, searchPattern) =>
	getNodesByGitignorePath(unifiedMapNode, searchPattern)
)
