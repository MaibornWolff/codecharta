import { createSelector } from "../../state/angular-redux/createSelector"
import { rightClickedNodeDataSelector } from "../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.selector"
import { idToNodeSelector } from "../../state/store/lookUp/idToNode/idToNode.selector"

export const rightClickedCodeMapNodeSelector = createSelector(
	[rightClickedNodeDataSelector, idToNodeSelector],
	(rightClickedNodeData, idToNode) => (rightClickedNodeData ? idToNode.get(rightClickedNodeData.nodeId) : null)
)
