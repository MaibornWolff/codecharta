// Plop: Append reducer import here
import { idToNode } from "./idToNode/idToNode.reducer"
import { idToBuilding } from "./idToBuilding/idToBuilding.reducer"
import { combineReducers } from "redux"

const lookUp = combineReducers({
	// Plop: Append sub-reducer here
	idToNode,
	idToBuilding
})

export default lookUp
