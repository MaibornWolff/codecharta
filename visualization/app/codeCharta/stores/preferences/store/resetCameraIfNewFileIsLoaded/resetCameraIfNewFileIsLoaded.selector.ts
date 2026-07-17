import { createSelector } from "@ngrx/store"
import { preferencesSelector } from "../preferences.selector"

export const resetCameraIfNewFileIsLoadedSelector = createSelector(
    preferencesSelector,
    preferences => preferences.resetCameraIfNewFileIsLoaded
)
