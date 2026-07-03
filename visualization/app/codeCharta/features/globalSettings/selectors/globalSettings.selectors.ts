import { createSelector } from "@ngrx/store"
import { preferencesSelector } from "../../../preferences/preferences.read.facade"
import { mapStateSelector } from "../../../mapState/mapState.facade"

export const screenshotToClipboardEnabledSelector = createSelector(
    preferencesSelector,
    preferences => preferences.screenshotToClipboardEnabled
)

export const experimentalFeaturesEnabledSelector = createSelector(
    preferencesSelector,
    preferences => preferences.experimentalFeaturesEnabled
)

export const isWhiteBackgroundSelector = createSelector(mapStateSelector, mapState => mapState.isWhiteBackground)

export const hideFlatBuildingsSelector = createSelector(mapStateSelector, mapState => mapState.hideFlatBuildings)

export const resetCameraIfNewFileIsLoadedSelector = createSelector(
    preferencesSelector,
    preferences => preferences.resetCameraIfNewFileIsLoaded
)

export const layoutAlgorithmSelector = createSelector(mapStateSelector, mapState => mapState.layoutAlgorithm)

export const maxTreeMapFilesSelector = createSelector(preferencesSelector, preferences => preferences.maxTreeMapFiles)
