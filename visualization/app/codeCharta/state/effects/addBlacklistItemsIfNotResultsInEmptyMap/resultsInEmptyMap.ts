import { hierarchy, HierarchyNode } from "d3-hierarchy"
import { BlacklistItem, BlacklistType, CCFile, CodeMapNode } from "../../../codeCharta.model"
import { FileState } from "../../../model/files/files"
import { isLeaf, isPathBlacklisted } from "../../../util/codeMapHelper"

export const resultsInEmptyMap = (
	visibleFiles: FileState[],
	currentBlacklist: BlacklistItem[],
	itemsToBeBlackListened: BlacklistItem[]
) => {
	const newBlacklist = [...currentBlacklist, ...itemsToBeBlackListened]
	for (const { file } of visibleFiles) {
		if (!resultsInEmptyFile(file, newBlacklist)) {
			return false
		}
	}
	return true
}

const resultsInEmptyFile = (file: CCFile, blacklist: BlacklistItem[]) => {
	for (const node of hierarchy(file.map)) {
		if (isNodeIncluded(node, blacklist)) {
			return false
		}
	}
	return true
}

const isNodeIncluded = (node: HierarchyNode<CodeMapNode>, blacklist: Array<BlacklistItem>) =>
	isLeaf(node) && node.data.path && !isPathBlacklisted(node.data.path, blacklist, BlacklistType.exclude)
