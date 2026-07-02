// Slice 9c structural step: the markedPackages store folder was git mv'd into the sharedView home, but is
// still combined here (via the sharedView facade) so state.fileSettings.markedPackages is unchanged. The
// behavioral step drops it from this reducer and registers it under the sharedView combineReducers.
import { defaultMarkedPackages, markedPackages } from "../../../sharedView/sharedView.facade"
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
