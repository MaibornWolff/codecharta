import { combineReducers } from "@ngrx/store"
import { defaultIsPresentationMode, isPresentationMode } from "./isPresentationMode/isPresentationMode.reducer"
import { defaultResetCameraIfNewFileIsLoaded, resetCameraIfNewFileIsLoaded } from "./resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.reducer"
import { defaultSortingOrderAscending, sortingOrderAscending } from "./sortingOrderAscending/sortingOrderAscending.reducer"
import { defaultMaxTreeMapFiles, maxTreeMapFiles } from "./maxTreeMapFiles/maxTreeMapFiles.reducer"
import { defaultExperimentalFeaturesEnabled, experimentalFeaturesEnabled } from "./enableExperimentalFeatures/experimentalFeaturesEnabled.reducer"
import { defaultScreenshotToClipboardEnabled, screenshotToClipboardEnabled } from "./enableClipboard/screenshotToClipboardEnabled.reducer"
import {
    defaultIsColorMetricLinkedToHeightMetric,
    isColorMetricLinkedToHeightMetric
} from "./isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.reducer"
import { defaultSortingOption, sortingOption } from "./sortingOption/sortingOption.reducer"

export const preferences = combineReducers({
    isPresentationMode,
    resetCameraIfNewFileIsLoaded,
    sortingOrderAscending,
    maxTreeMapFiles,
    experimentalFeaturesEnabled,
    screenshotToClipboardEnabled,
    isColorMetricLinkedToHeightMetric,
    sortingOption
})

export const defaultPreferences = {
    isPresentationMode: defaultIsPresentationMode,
    resetCameraIfNewFileIsLoaded: defaultResetCameraIfNewFileIsLoaded,
    sortingOrderAscending: defaultSortingOrderAscending,
    maxTreeMapFiles: defaultMaxTreeMapFiles,
    experimentalFeaturesEnabled: defaultExperimentalFeaturesEnabled,
    screenshotToClipboardEnabled: defaultScreenshotToClipboardEnabled,
    isColorMetricLinkedToHeightMetric: defaultIsColorMetricLinkedToHeightMetric,
    sortingOption: defaultSortingOption
}
