import { defaultSortingOption, sortingOption } from "./sortingOption/sortingOption.reducer"
import { combineReducers } from "@ngrx/store"

export const dynamicSettings = combineReducers({
    sortingOption
})

export const defaultDynamicSettings = {
    sortingOption: defaultSortingOption
}
