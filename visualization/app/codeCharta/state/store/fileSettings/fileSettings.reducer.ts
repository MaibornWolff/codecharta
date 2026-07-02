import { defaultMarkedPackages, markedPackages } from "./markedPackages/markedPackages.reducer"
import { defaultEdges, edges } from "./edges/edges.reducer"
import { combineReducers } from "@ngrx/store"
import { FileSettings } from "../../../codeCharta.model"

// Slice 9b: blacklist moved out of this combineReducers into the sharedView home
// (sharedView.reducer). What remains here is edges + markedPackages.
export const fileSettings = combineReducers({
    markedPackages,
    edges
})

export const defaultFileSettings: FileSettings = {
    markedPackages: defaultMarkedPackages,
    edges: defaultEdges
}
