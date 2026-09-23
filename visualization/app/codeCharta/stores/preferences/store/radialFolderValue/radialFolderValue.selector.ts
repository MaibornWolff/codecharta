import { createSelector } from "@ngrx/store"
import { preferencesSelector } from "../preferences.selector"

export const radialFolderValueSelector = createSelector(preferencesSelector, preferences => preferences.radialFolderValue)
