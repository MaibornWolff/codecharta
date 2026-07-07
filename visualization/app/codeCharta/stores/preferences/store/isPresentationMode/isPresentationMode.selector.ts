import { createSelector } from "@ngrx/store"
import { preferencesSelector } from "../preferences.selector"

export const isPresentationModeSelector = createSelector(preferencesSelector, preferences => preferences.isPresentationMode)
