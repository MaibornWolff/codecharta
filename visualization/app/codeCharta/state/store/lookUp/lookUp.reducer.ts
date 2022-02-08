import { idToBuilding } from "./idToBuilding/idToBuilding.reducer"
import { combineReducers } from "redux"

const lookUp = combineReducers({
	idToBuilding
})

export default lookUp
