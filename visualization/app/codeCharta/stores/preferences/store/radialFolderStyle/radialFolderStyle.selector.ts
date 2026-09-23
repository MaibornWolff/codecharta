import { createSelector } from "@ngrx/store"
import { preferencesSelector } from "../preferences.selector"

export const radialFolderStyleSelector = createSelector(preferencesSelector, preferences => preferences.radialFolderStyle)
