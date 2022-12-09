import { markedPackages } from "./markedPackages/markedPackages.reducer"
import { edges } from "./edges/edges.reducer"
import { attributeTypes } from "./attributeTypes/attributeTypes.reducer"
import { blacklist } from "./blacklist/blacklist.reducer"
import { combineReducers } from "redux"
import { attributeDescriptors } from "./attributeDescriptors/attributeDescriptors.reducer"

const fileSettings = combineReducers({
	markedPackages,
	edges,
	attributeTypes,
	attributeDescriptors,
	blacklist
})

export default fileSettings
