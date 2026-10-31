import { createSelector } from "@ngrx/store"
import { preferencesSelector } from "../preferences.selector"

export const localSourceEnabledSelector = createSelector(preferencesSelector, preferences => preferences.localSourceEnabled)
