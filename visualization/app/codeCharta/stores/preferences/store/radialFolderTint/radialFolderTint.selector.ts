import { createSelector } from "@ngrx/store"
import { preferencesSelector } from "../preferences.selector"

export const radialFolderTintSelector = createSelector(preferencesSelector, preferences => preferences.radialFolderTint)
