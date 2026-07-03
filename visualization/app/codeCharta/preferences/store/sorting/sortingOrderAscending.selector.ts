import { createSelector } from "@ngrx/store"
import { preferencesSelector } from "../preferences.selector"

export const sortingOrderAscendingSelector = createSelector(preferencesSelector, preferences => preferences.sortingOrderAscending)
