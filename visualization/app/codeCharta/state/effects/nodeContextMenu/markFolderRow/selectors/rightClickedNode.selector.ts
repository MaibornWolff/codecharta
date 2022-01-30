import { createSelector } from "../../../../angular-redux/createSelector"
import { rightClickedNodeDataSelector } from "../../../../store/appStatus/rightClickedNodeData/rightClickedNodeData.selector"
import { idToBuildingSelector } from "../../../../store/lookUp/idToBuilding/idToBuilding.selector"
import { CodeMapBuilding } from "../../../../../ui/codeMap/rendering/codeMapBuilding"

export const _getNode = (idToBuilding: Map<number, CodeMapBuilding>, rightClickedNodeData: { nodeId: number }) =>
	rightClickedNodeData !== null ? idToBuilding.get(rightClickedNodeData.nodeId).node : null

export const rightClickedNodeSelector = createSelector([idToBuildingSelector, rightClickedNodeDataSelector], _getNode)
