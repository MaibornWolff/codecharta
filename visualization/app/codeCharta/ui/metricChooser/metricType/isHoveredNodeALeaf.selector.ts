import { createSelector } from "../../../state/angular-redux/createSelector"
import { idToNodeSelector } from "../../../state/selectors/accumulatedData/idToNode.selector"
import { hoveredNodeIdSelector } from "../../../state/store/appStatus/hoveredNodeId/hoveredNodeId.selector"
import { isLeaf } from "../../../util/codeMapHelper"

export const isHoveredNodeALeafSelector = createSelector([idToNodeSelector, hoveredNodeIdSelector], (idToNode, hoveredNodeId) => {
	// todo why can idToNode be undefined?
	const node = idToNode?.get(hoveredNodeId)
	return node && isLeaf(node)
})
