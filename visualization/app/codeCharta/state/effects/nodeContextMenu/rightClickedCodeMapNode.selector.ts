import { createSelector } from "../../angular-redux/createSelector"
import { rightClickedNodeDataSelector } from "../../store/appStatus/rightClickedNodeData/rightClickedNodeData.selector"
import { idToNodeSelector } from "../../store/lookUp/idToNode/idToNode.selector"

export const rightClickedCodeMapNodeSelector = createSelector(
	[rightClickedNodeDataSelector, idToNodeSelector],
	(rightClickedNodeData, idToNode) => (rightClickedNodeData ? idToNode.get(rightClickedNodeData.nodeId) : null)
)
