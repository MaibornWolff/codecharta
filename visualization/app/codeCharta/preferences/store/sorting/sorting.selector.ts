import { createSelector } from "@ngrx/store"
import { preferencesSelector } from "../preferences.selector"

export const sortingOrderSelector = createSelector(preferencesSelector, preferences => preferences.sortingOption)
