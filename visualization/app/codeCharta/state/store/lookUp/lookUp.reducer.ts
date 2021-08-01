// Plop: Append reducer import here
import { idToNode } from "./idToNode/idToNode.reducer"
import { idToBuilding } from "./idToBuilding/idToBuilding.reducer"
import { selectedBuildingId } from "./selectedBuildingId/selectedBuildingId.reducer"
import { combineReducers } from "redux"

const lookUp = combineReducers({
	// Plop: Append sub-reducer here
	idToNode,
	idToBuilding,
	selectedBuildingId
})

export default lookUp
