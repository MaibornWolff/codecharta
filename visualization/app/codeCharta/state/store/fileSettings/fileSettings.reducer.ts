import { defaultMarkedPackages, markedPackages } from "./markedPackages/markedPackages.reducer"
import { defaultEdges, edges } from "./edges/edges.reducer"
import { blacklist, defaultBlacklist } from "./blacklist/blacklist.reducer"
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
