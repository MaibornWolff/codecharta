import { createSelector } from "@ngrx/store"
import { preferencesSelector } from "../preferences.selector"

export const radialLevelsSelector = createSelector(preferencesSelector, preferences => preferences.radialLevels)
