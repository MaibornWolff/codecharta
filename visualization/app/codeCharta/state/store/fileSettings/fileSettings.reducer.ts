// Plop: Append reducer import here
import { edges } from "./edges/edges.reducer"
import { attributeTypes } from "./attributeTypes/attributeTypes.reducer"
import { blacklist } from "./blacklist/blacklist.reducer"
import { combineReducers } from "redux"

const fileSettings = combineReducers({
	// Plop: Append reducer usage here
	edges,
	attributeTypes,
	blacklist
})

export default fileSettings
