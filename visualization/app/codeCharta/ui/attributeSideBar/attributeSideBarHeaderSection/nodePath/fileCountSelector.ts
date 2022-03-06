import { createSelector } from "../../../../state/angular-redux/createSelector"
import { selectedNodeSelector } from "../../../../state/selectors/selectedNode.selector"
import { CodeMapNode } from "../../../../codeCharta.model"

export interface FileCounter {
	fileCount: number
	added: number
	removed: number
}

export const getFileCount = (node?: Pick<CodeMapNode, "attributes" | "deltas">): FileCounter => {
	if (!node) {
		return
	}

	return {
		fileCount: node.attributes?.unary ?? 0,
		added: node.deltas?.addedFiles ?? 0,
		removed: node.deltas?.removedFiles ?? 0
	}
}

export const fileCountSelector = createSelector([selectedNodeSelector], getFileCount)
