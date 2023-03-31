import { markedPackages } from "./markedPackages/markedPackages.reducer"
import { edges } from "./edges/edges.reducer"
import { attributeTypes } from "./attributeTypes/attributeTypes.reducer"
import { blacklist } from "./blacklist/blacklist.reducer"
import { attributeDescriptors } from "./attributeDescriptors/attributeDescriptors.reducer"
import { combineReducers } from "@ngrx/store"

export const fileSettings = combineReducers({
	markedPackages,
	edges,
	attributeTypes,
	attributeDescriptors,
	blacklist
})
