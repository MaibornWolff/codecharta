import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../state/store/appSettings/appSettings.selector"

export const screenshotToClipboardEnabledSelector = createSelector(
    appSettingsSelector,
    appSettings => appSettings.screenshotToClipboardEnabled
)

export const experimentalFeaturesEnabledSelector = createSelector(
    appSettingsSelector,
    appSettings => appSettings.experimentalFeaturesEnabled
)

export const isWhiteBackgroundSelector = createSelector(appSettingsSelector, appSettings => appSettings.isWhiteBackground)

export const hideFlatBuildingsSelector = createSelector(appSettingsSelector, appSettings => appSettings.hideFlatBuildings)

export const resetCameraIfNewFileIsLoadedSelector = createSelector(
    appSettingsSelector,
    appSettings => appSettings.resetCameraIfNewFileIsLoaded
)

export const layoutAlgorithmSelector = createSelector(appSettingsSelector, appSettings => appSettings.layoutAlgorithm)

export const maxTreeMapFilesSelector = createSelector(appSettingsSelector, appSettings => appSettings.maxTreeMapFiles)

export const sharpnessModeSelector = createSelector(appSettingsSelector, appSettings => appSettings.sharpnessMode)
