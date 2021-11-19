import { idToNode } from "./idToNode/idToNode.reducer"
import { idToBuilding } from "./idToBuilding/idToBuilding.reducer"
import { combineReducers } from "redux"

const lookUp = combineReducers({
	idToNode,
	idToBuilding
})

export default lookUp
