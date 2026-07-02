import { combineReducers } from "@ngrx/store"
import { SharedView } from "../../codeCharta.model"
import { defaultFocusedNodePath, focusedNodePath } from "./focusedNodePath/focusedNodePath.reducer"
import { defaultSearchPattern, searchPattern } from "./searchPattern/searchPattern.reducer"
import { blacklist, defaultBlacklist } from "./blacklist/blacklist.reducer"
import { defaultMarkedPackages, markedPackages } from "./markedPackages/markedPackages.reducer"

export const sharedView = combineReducers({
    focusedNodePath,
    searchPattern,
    blacklist,
    markedPackages
})

export const defaultSharedView: SharedView = {
    focusedNodePath: defaultFocusedNodePath,
    searchPattern: defaultSearchPattern,
    blacklist: defaultBlacklist,
    markedPackages: defaultMarkedPackages
}
