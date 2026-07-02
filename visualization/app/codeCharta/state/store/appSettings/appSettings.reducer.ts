import { defaultSortingOrderAscending, sortingOrderAscending } from "./sortingOrderAscending/sortingOrderAscending.reducer"
import { defaultIsLoadingFile, isLoadingFile } from "./isLoadingFile/isLoadingFile.reducer"
import {
    defaultResetCameraIfNewFileIsLoaded,
    resetCameraIfNewFileIsLoaded
} from "./resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.reducer"
import { defaultIsPresentationMode, isPresentationMode } from "./isPresentationMode/isPresentationMode.reducer"
import {
    defaultExperimentalFeaturesEnabled,
    experimentalFeaturesEnabled
} from "./enableExperimentalFeatures/experimentalFeaturesEnabled.reducer"
import { defaultMaxTreeMapFiles, maxTreeMapFiles } from "./maxTreeMapFiles/maxTreeMapFiles.reducer"
import { defaultScreenshotToClipboardEnabled, screenshotToClipboardEnabled } from "./enableClipboard/screenshotToClipboardEnabled.reducer"
import {
    defaultIsColorMetricLinkedToHeightMetric,
    isColorMetricLinkedToHeightMetric
} from "./isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.reducer"
import { combineReducers } from "@ngrx/store"

export const appSettings = combineReducers({
    sortingOrderAscending,
    isLoadingFile,
    resetCameraIfNewFileIsLoaded,
    isPresentationMode,
    experimentalFeaturesEnabled,
    screenshotToClipboardEnabled,
    maxTreeMapFiles,
    isColorMetricLinkedToHeightMetric
})

export const defaultAppSettings = {
    sortingOrderAscending: defaultSortingOrderAscending,
    isLoadingFile: defaultIsLoadingFile,
    resetCameraIfNewFileIsLoaded: defaultResetCameraIfNewFileIsLoaded,
    isPresentationMode: defaultIsPresentationMode,
    experimentalFeaturesEnabled: defaultExperimentalFeaturesEnabled,
    screenshotToClipboardEnabled: defaultScreenshotToClipboardEnabled,
    maxTreeMapFiles: defaultMaxTreeMapFiles,
    isColorMetricLinkedToHeightMetric: defaultIsColorMetricLinkedToHeightMetric
}
