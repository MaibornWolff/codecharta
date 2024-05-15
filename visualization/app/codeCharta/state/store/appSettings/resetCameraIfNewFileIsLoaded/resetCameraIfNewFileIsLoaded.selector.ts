import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const resetCameraIfNewFileIsLoadedSelector = createSelector(
    appSettingsSelector,
    appSettings => appSettings.resetCameraIfNewFileIsLoaded
)
