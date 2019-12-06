// Plop: Append reducer import here
import { combineReducers } from "redux"
import { mapSize } from "./mapSize/mapSize.reducer"

const treeMap = combineReducers({
	mapSize
})

export default treeMap
