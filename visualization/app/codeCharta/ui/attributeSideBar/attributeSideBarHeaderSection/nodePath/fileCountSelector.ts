import { selectedNodeSelector } from "../../../../state/selectors/selectedNode.selector"
import { CodeMapNode, FileCount } from "../../../../codeCharta.model"
import { createSelector } from "@ngrx/store"

export const getFileCount = (node?: Pick<CodeMapNode, "attributes" | "fileCount">): FileCount => {
	if (!node) {
		return
	}

	return {
		all: node.attributes?.unary ?? 0,
		added: node.fileCount?.added ?? 0,
		removed: node.fileCount?.removed ?? 0,
		changed: node.fileCount?.changed ?? 0
	}
}

export const fileCountSelector = createSelector(selectedNodeSelector, getFileCount)
