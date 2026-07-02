import { combineReducers } from "@ngrx/store"
import { SharedView } from "../../codeCharta.model"
import { defaultFocusedNodePath, focusedNodePath } from "./focusedNodePath/focusedNodePath.reducer"
import { defaultSearchPattern, searchPattern } from "./searchPattern/searchPattern.reducer"
import { blacklist, defaultBlacklist } from "./blacklist/blacklist.reducer"

export const sharedView = combineReducers({
    focusedNodePath,
    searchPattern,
    blacklist
})

export const defaultSharedView: SharedView = {
    focusedNodePath: defaultFocusedNodePath,
    searchPattern: defaultSearchPattern,
    blacklist: defaultBlacklist
}
