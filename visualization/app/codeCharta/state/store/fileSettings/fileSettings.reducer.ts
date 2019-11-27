// Plop: Append reducer import here
import { blacklist } from "./blacklist/blacklist.reducer"
import { combineReducers } from "redux"

const fileSettings = combineReducers({
	// Plop: Append reducer usage here
	blacklist
})

export default fileSettings
