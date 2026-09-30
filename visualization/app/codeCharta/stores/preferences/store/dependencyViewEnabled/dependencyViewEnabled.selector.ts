import { createSelector } from "@ngrx/store"
import { preferencesSelector } from "../preferences.selector"

export const dependencyViewEnabledSelector = createSelector(preferencesSelector, preferences => preferences.dependencyViewEnabled)
