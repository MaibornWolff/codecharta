import { blacklist } from "./blacklist"
import { combineReducers } from "redux"

const fileSettings = combineReducers({
	blacklist
})

export default fileSettings
