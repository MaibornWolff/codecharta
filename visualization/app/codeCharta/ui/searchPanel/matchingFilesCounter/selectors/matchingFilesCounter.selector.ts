import { BlacklistItem, BlacklistType, CodeMapNode } from "../../../../codeCharta.model"
import { createSelector } from "../../../../state/angular-redux/store"
import { searchedNodesSelector } from "../../../../state/selectors/searchedNodes/searchedNodes.selector"
import { blacklistSelector } from "../../../../state/store/fileSettings/blacklist/blacklist.selector"
import { CcState } from "../../../../state/store/store"
import {isLeaf, isPathBlacklisted} from "../../../../util/codeMapHelper"
import {codeMapNodesSelector} from "../../../../state/selectors/accumulatedData/codeMapNodes.selector"

const getBlacklistedFileCount = (blacklistType: BlacklistType, nodes: CodeMapNode[], blacklist: BlacklistItem[]) =>
	nodes.reduce((count, node) => (isPathBlacklisted(node.path, blacklist, blacklistType) ? count + 1 : count), 0)

export type MatchingFilesCounter = {
	fileCount: string
	flattenCount: string
	excludeCount: string
}

export const matchingFilesCounterSelector: (state: CcState) => MatchingFilesCounter = createSelector(
	[searchedNodesSelector, blacklistSelector, codeMapNodesSelector],
	(searchedNodes, blacklist, allNodes) => {
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
