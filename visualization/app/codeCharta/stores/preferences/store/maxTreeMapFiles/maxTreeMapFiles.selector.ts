import { createSelector } from "@ngrx/store"
import { preferencesSelector } from "../preferences.selector"

export const maxTreeMapFilesSelector = createSelector(preferencesSelector, preferences => preferences.maxTreeMapFiles)
