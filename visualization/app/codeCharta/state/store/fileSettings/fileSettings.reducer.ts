import { defaultMarkedPackages, markedPackages } from "./markedPackages/markedPackages.reducer"
import { defaultEdges, edges } from "./edges/edges.reducer"
// Slice 9b structural step: the blacklist store folder was git mv'd into the sharedView home, but is
// still combined here (via the sharedView facade) so state.fileSettings.blacklist is unchanged. The
// behavioral step drops it from this reducer and registers it under the sharedView combineReducers.
import { blacklist, defaultBlacklist } from "../../../sharedView/sharedView.facade"
import { combineReducers } from "@ngrx/store"
import { FileSettings } from "../../../codeCharta.model"

export const fileSettings = combineReducers({
    markedPackages,
    edges,
    blacklist
})

export const defaultFileSettings: FileSettings = {
    markedPackages: defaultMarkedPackages,
    edges: defaultEdges,
    blacklist: defaultBlacklist
}
