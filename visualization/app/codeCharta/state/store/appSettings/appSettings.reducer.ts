// Transitional (Slice 10b structural): the seven ex-appSettings pref leaves moved to
// preferences/store/; appSettings.reducer keeps combining them via the preferences facade so the
// state shape (state.appSettings.*) is unchanged until the behavioral commit stands up the
// preferences root and deletes this grab-bag.
import {
    defaultSortingOrderAscending,
    sortingOrderAscending,
    defaultResetCameraIfNewFileIsLoaded,
    resetCameraIfNewFileIsLoaded,
    defaultIsPresentationMode,
    isPresentationMode,
    defaultExperimentalFeaturesEnabled,
    experimentalFeaturesEnabled,
    defaultMaxTreeMapFiles,
    maxTreeMapFiles,
    defaultScreenshotToClipboardEnabled,
    screenshotToClipboardEnabled,
    defaultIsColorMetricLinkedToHeightMetric,
    isColorMetricLinkedToHeightMetric
} from "../../../preferences/preferences.facade"
import { combineReducers } from "@ngrx/store"

export const appSettings = combineReducers({
    sortingOrderAscending,
    resetCameraIfNewFileIsLoaded,
    isPresentationMode,
    experimentalFeaturesEnabled,
    screenshotToClipboardEnabled,
    maxTreeMapFiles,
    isColorMetricLinkedToHeightMetric
})

export const defaultAppSettings = {
    sortingOrderAscending: defaultSortingOrderAscending,
    resetCameraIfNewFileIsLoaded: defaultResetCameraIfNewFileIsLoaded,
    isPresentationMode: defaultIsPresentationMode,
    experimentalFeaturesEnabled: defaultExperimentalFeaturesEnabled,
    screenshotToClipboardEnabled: defaultScreenshotToClipboardEnabled,
    maxTreeMapFiles: defaultMaxTreeMapFiles,
    isColorMetricLinkedToHeightMetric: defaultIsColorMetricLinkedToHeightMetric
}
