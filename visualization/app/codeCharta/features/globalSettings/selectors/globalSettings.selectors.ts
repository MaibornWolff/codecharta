import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../state/store/appSettings/appSettings.selector"
import { mapStateSelector } from "../../../mapState/mapState.facade"

export const screenshotToClipboardEnabledSelector = createSelector(
    appSettingsSelector,
    appSettings => appSettings.screenshotToClipboardEnabled
)

export const experimentalFeaturesEnabledSelector = createSelector(
    appSettingsSelector,
    appSettings => appSettings.experimentalFeaturesEnabled
)

export const isWhiteBackgroundSelector = createSelector(mapStateSelector, mapState => mapState.isWhiteBackground)

export const hideFlatBuildingsSelector = createSelector(mapStateSelector, mapState => mapState.hideFlatBuildings)

export const resetCameraIfNewFileIsLoadedSelector = createSelector(
    appSettingsSelector,
    appSettings => appSettings.resetCameraIfNewFileIsLoaded
)

export const layoutAlgorithmSelector = createSelector(appSettingsSelector, appSettings => appSettings.layoutAlgorithm)

export const maxTreeMapFilesSelector = createSelector(appSettingsSelector, appSettings => appSettings.maxTreeMapFiles)
