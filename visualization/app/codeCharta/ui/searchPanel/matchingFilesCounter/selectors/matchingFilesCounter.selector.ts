import { BlacklistItem, BlacklistType, CodeMapNode } from "../../../../codeCharta.model"
import { searchedNodesSelector } from "../../../../state/selectors/searchedNodes/searchedNodes.selector"
import { blacklistSelector } from "../../../../state/store/fileSettings/blacklist/blacklist.selector"
import { isLeaf, isPathBlacklisted } from "../../../../util/codeMapHelper"
import { codeMapNodesSelector } from "../../../../state/selectors/accumulatedData/codeMapNodes.selector"
import { createSelector } from "@ngrx/store"

const getBlacklistedFileCount = (blacklistType: BlacklistType, nodes: CodeMapNode[], blacklist: BlacklistItem[]) =>
	nodes.reduce((count, node) => (isPathBlacklisted(node.path, blacklist, blacklistType) ? count + 1 : count), 0)

export type MatchingFilesCounter = {
	fileCount: string
	flattenCount: string
	excludeCount: string
}

export const _calculateMatchingFilesCounter = (searchedNodes: CodeMapNode[], blacklist: BlacklistItem[], allNodes: CodeMapNode[]) => {
	const searchedNodeLeaves = searchedNodes.filter(node => isLeaf(node))
	return {
		fileCount: `${searchedNodeLeaves.length}/${allNodes.length}`,
		flattenCount: `${getBlacklistedFileCount("flatten", searchedNodeLeaves, blacklist)}/${getBlacklistedFileCount(
			"flatten",
			allNodes,
			blacklist
		)}`,
		excludeCount: `${getBlacklistedFileCount("exclude", searchedNodeLeaves, blacklist)}/${getBlacklistedFileCount(
			"exclude",
			allNodes,
			blacklist
		)}`
	}
}

export const matchingFilesCounterSelector = createSelector(
	searchedNodesSelector,
	blacklistSelector,
	codeMapNodesSelector,
	_calculateMatchingFilesCounter
)
