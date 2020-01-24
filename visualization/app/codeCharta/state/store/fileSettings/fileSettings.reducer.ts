// Plop: Append reducer import here
import { files } from "./files/files.reducer"
import { markedPackages } from "./markedPackages/markedPackages.reducer"
import { edges } from "./edges/edges.reducer"
import { attributeTypes } from "./attributeTypes/attributeTypes.reducer"
import { blacklist } from "./blacklist/blacklist.reducer"
import { combineReducers } from "redux"

const fileSettings = combineReducers({
	// Plop: Append sub-reducer here
	files,
	markedPackages,
	edges,
	attributeTypes,
	blacklist
})

export default fileSettings
