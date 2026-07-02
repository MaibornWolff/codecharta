import { combineReducers } from "@ngrx/store"
import { SharedView } from "../../codeCharta.model"
import { defaultFocusedNodePath, focusedNodePath } from "./focusedNodePath/focusedNodePath.reducer"
import { defaultSearchPattern, searchPattern } from "./searchPattern/searchPattern.reducer"

export const sharedView = combineReducers({
    focusedNodePath,
    searchPattern
})

export const defaultSharedView: SharedView = {
    focusedNodePath: defaultFocusedNodePath,
    searchPattern: defaultSearchPattern
}
