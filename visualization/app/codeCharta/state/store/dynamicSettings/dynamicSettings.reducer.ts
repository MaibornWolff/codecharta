// Transitional (Slice 10b structural): sortingOption moved to preferences/store/; dynamicSettings.reducer
// keeps combining it via the preferences facade so state.dynamicSettings.sortingOption is unchanged
// until the behavioral commit stands up the preferences root and deletes this grab-bag.
import { defaultSortingOption, sortingOption } from "../../../preferences/preferences.facade"
import { combineReducers } from "@ngrx/store"

export const dynamicSettings = combineReducers({
    sortingOption
})

export const defaultDynamicSettings = {
    sortingOption: defaultSortingOption
}
