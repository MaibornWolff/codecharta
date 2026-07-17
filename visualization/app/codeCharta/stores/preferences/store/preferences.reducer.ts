import { combineReducers } from "@ngrx/store"
import { defaultScreenshotToClipboardEnabled, screenshotToClipboardEnabled } from "./enableClipboard/screenshotToClipboardEnabled.reducer"
import {
    defaultExperimentalFeaturesEnabled,
    experimentalFeaturesEnabled
} from "./enableExperimentalFeatures/experimentalFeaturesEnabled.reducer"
import {
    defaultIsColorMetricLinkedToHeightMetric,
    isColorMetricLinkedToHeightMetric
} from "./isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.reducer"
import { defaultIsPresentationMode, isPresentationMode } from "./isPresentationMode/isPresentationMode.reducer"
import { defaultMaxTreeMapFiles, maxTreeMapFiles } from "./maxTreeMapFiles/maxTreeMapFiles.reducer"
import {
    defaultResetCameraIfNewFileIsLoaded,
    resetCameraIfNewFileIsLoaded
} from "./resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.reducer"
import { defaultSorting, sorting } from "./sorting/sorting.reducer"

export const preferences = combineReducers({
    isPresentationMode,
    resetCameraIfNewFileIsLoaded,
    maxTreeMapFiles,
    experimentalFeaturesEnabled,
    screenshotToClipboardEnabled,
    isColorMetricLinkedToHeightMetric,
    sorting
})

export const defaultPreferences = {
    isPresentationMode: defaultIsPresentationMode,
    resetCameraIfNewFileIsLoaded: defaultResetCameraIfNewFileIsLoaded,
    maxTreeMapFiles: defaultMaxTreeMapFiles,
    experimentalFeaturesEnabled: defaultExperimentalFeaturesEnabled,
    screenshotToClipboardEnabled: defaultScreenshotToClipboardEnabled,
    isColorMetricLinkedToHeightMetric: defaultIsColorMetricLinkedToHeightMetric,
    sorting: defaultSorting
}
