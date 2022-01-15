import { createSelector } from "../../../../state/angular-redux/createSelector"
import { rightClickedNodeDataSelector } from "../../../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.selector"
import { idToBuildingSelector } from "../../../../state/store/lookUp/idToBuilding/idToBuilding.selector"

export const rightClickedNodeSelector = createSelector(
	[idToBuildingSelector, rightClickedNodeDataSelector],
	(idToBuilding, rightClickedNodeData) => (rightClickedNodeData !== null ? idToBuilding.get(rightClickedNodeData.nodeId).node : null)
)
