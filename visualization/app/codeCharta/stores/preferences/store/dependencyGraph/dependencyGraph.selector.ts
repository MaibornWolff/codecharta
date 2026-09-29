import { createSelector } from "@ngrx/store"
import { preferencesSelector } from "../preferences.selector"

export const dependencyGraphSettingsSelector = createSelector(preferencesSelector, preferences => preferences.dependencyGraph)
