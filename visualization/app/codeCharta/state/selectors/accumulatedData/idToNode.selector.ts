import { hierarchy } from "d3-hierarchy"
import { CodeMapNode } from "../../../codeCharta.model"
import { createSelector } from "../../angular-redux/createSelector"
import { unifiedMapNodeSelector } from "./unifiedMapNode.selector"

export const _calculateIdToNode = (unifiedMapNode: CodeMapNode | undefined): Map<number, CodeMapNode> => {
	if (!unifiedMapNode) {
		return new Map()
	}

	const idToNode: Map<number, CodeMapNode> = new Map([[unifiedMapNode.id, unifiedMapNode]])
	for (const { data } of hierarchy(unifiedMapNode)) {
		idToNode.set(data.id, data)
	}
	return idToNode
}

export const idToNodeSelector = createSelector([unifiedMapNodeSelector], _calculateIdToNode)
