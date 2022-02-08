import { createSelector } from "../../angular-redux/createSelector"
import { idToNodeSelector } from "../../selectors/accumulatedData/idToNode.selector"
import { rightClickedNodeDataSelector } from "../../store/appStatus/rightClickedNodeData/rightClickedNodeData.selector"

export const rightClickedCodeMapNodeSelector = createSelector(
	[rightClickedNodeDataSelector, idToNodeSelector],
	(rightClickedNodeData, idToNode) => (rightClickedNodeData ? idToNode.get(rightClickedNodeData.nodeId) : null)
)
