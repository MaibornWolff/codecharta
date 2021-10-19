import { BlacklistItem, BlacklistType, CodeMapNode } from "../../../codeCharta.model"
import { createSelector } from "../../../state/angular-redux/store"
import { unifiedMapNodeSelector } from "../../../state/selectors/accumulatedData/unifiedMapNode.selector"
import { searchPatternSelector } from "../../../state/store/dynamicSettings/searchPattern/searchPattern.selector"
import { blacklistSelector } from "../../../state/store/fileSettings/blacklist/blacklist.selector"
import { CcState } from "../../../state/store/store"
import { getAllNodes, getNodesByGitignorePath, isLeaf, isPathBlacklisted } from "../../../util/codeMapHelper"

const getBlacklistedFileCount = (blacklistType: BlacklistType, nodes: CodeMapNode[], blacklist: BlacklistItem[]) =>
	nodes.reduce((count, node) => (isPathBlacklisted(node.path, blacklist, blacklistType) ? count + 1 : count), 0)

export type MatchingFilesCounter = {
	fileCount: string
	flattenCount: string
	excludeCount: string
}

export const matchingFilesCounterSelector: (state: CcState) => MatchingFilesCounter = createSelector(
	[unifiedMapNodeSelector, searchPatternSelector, blacklistSelector],
	(unifiedMapNode, searchPattern, blacklist) => {
		const allNodes = getAllNodes(unifiedMapNode)
		const searchedNodes = getNodesByGitignorePath(unifiedMapNode, searchPattern)
		const searchedNodeLeaves = searchedNodes.filter(node => isLeaf(node))
		return {
			fileCount: `${searchedNodeLeaves.length}/${allNodes.length}`,
			flattenCount: `${getBlacklistedFileCount(BlacklistType.flatten, searchedNodeLeaves, blacklist)}/${getBlacklistedFileCount(
				BlacklistType.flatten,
				allNodes,
				blacklist
			)}`,
			excludeCount: `${getBlacklistedFileCount(BlacklistType.exclude, searchedNodeLeaves, blacklist)}/${getBlacklistedFileCount(
				BlacklistType.exclude,
				allNodes,
				blacklist
			)}`
		}
	}
)
