// Plop: Append reducer import here
import { pathToBuilding } from "./pathToBuilding/pathToBuilding.reducer"
import { pathToNode } from "./pathToNode/pathToNode.reducer"
import { combineReducers } from "redux"

const lookUp = combineReducers({
	// Plop: Append sub-reducer here
	pathToBuilding,
	pathToNode
})

export default lookUp
