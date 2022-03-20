import { createSelector } from "../../../state/angular-redux/createSelector"
import { idToNodeSelector } from "../../../state/selectors/accumulatedData/idToNode.selector"
import { hoveredNodeIdSelector } from "../../../state/store/appStatus/hoveredNodeId/hoveredNodeId.selector"
import { isLeaf, MaybeLeaf } from "../../../util/codeMapHelper"

export const _isHoveredNodeALeaf = (idToNode: Map<number, MaybeLeaf>, hoveredNodeId: number | null) => {
	const node = idToNode.get(hoveredNodeId)
	return node && isLeaf(node)
}

export const isHoveredNodeALeafSelector = createSelector([idToNodeSelector, hoveredNodeIdSelector], _isHoveredNodeALeaf)
