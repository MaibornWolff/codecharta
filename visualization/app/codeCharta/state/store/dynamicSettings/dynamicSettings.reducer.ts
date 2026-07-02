import { defaultSortingOption, sortingOption } from "./sortingOption/sortingOption.reducer"
import { defaultSearchPattern, searchPattern } from "../../../sharedView/store/searchPattern/searchPattern.reducer"
import { defaultFocusedNodePath, focusedNodePath } from "../../../sharedView/store/focusedNodePath/focusedNodePath.reducer"
import { combineReducers } from "@ngrx/store"

export const dynamicSettings = combineReducers({
    sortingOption,
    searchPattern,
    focusedNodePath
})

export const defaultDynamicSettings = {
    sortingOption: defaultSortingOption,
    searchPattern: defaultSearchPattern,
    focusedNodePath: defaultFocusedNodePath
}
