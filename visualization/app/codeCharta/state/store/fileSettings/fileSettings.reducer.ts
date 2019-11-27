// Plop: Append reducer import here
import { attributeTypes } from "./attributeTypes/attributeTypes.reducer"
import { blacklist } from "./blacklist/blacklist.reducer"
import { combineReducers } from "redux"

const fileSettings = combineReducers({
	// Plop: Append reducer usage here
	attributeTypes,
	blacklist
})

export default fileSettings
