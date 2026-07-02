import { defaultEdges, edges } from "./edges/edges.reducer"
import { combineReducers } from "@ngrx/store"
import { FileSettings } from "../../../codeCharta.model"

// Slice 9b moved blacklist and Slice 9c moved markedPackages out of this combineReducers into the
// sharedView home (sharedView.reducer). What remains here is edges (DEFERRED — a merged render-model
// array re-homed by a later edge-UI / render-model slice, which then deletes this reducer).
export const fileSettings = combineReducers({
    edges
})

export const defaultFileSettings: FileSettings = {
    edges: defaultEdges
}
