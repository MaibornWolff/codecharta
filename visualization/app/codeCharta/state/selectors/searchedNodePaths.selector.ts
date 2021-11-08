import { createSelector } from "../angular-redux/store"
import { getNodesByGitignorePath } from "../../util/codeMapHelper"
import { unifiedMapNodeSelector } from "./accumulatedData/unifiedMapNode.selector"
import { searchPatternSelector } from "../store/dynamicSettings/searchPattern/searchPattern.selector"

export const searchedNodePathsSelector = createSelector(
	[unifiedMapNodeSelector, searchPatternSelector],
	(unifiedMapNode, searchPattern) => {
		const searchedNodes = getNodesByGitignorePath(unifiedMapNode, searchPattern)
		return new Set(searchedNodes.map(x => x.path))
	}
)
