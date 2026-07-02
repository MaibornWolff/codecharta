import { defaultSortingOrderAscending, sortingOrderAscending } from "./sortingOrderAscending/sortingOrderAscending.reducer"
import { defaultIsLoadingFile, isLoadingFile } from "./isLoadingFile/isLoadingFile.reducer"
import { defaultIsLoadingMap, isLoadingMap } from "../../../mapState/store/isLoadingMap/isLoadingMap.reducer"
import {
    defaultResetCameraIfNewFileIsLoaded,
    resetCameraIfNewFileIsLoaded
} from "./resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.reducer"
import { defaultIsPresentationMode, isPresentationMode } from "./isPresentationMode/isPresentationMode.reducer"
import {
    defaultExperimentalFeaturesEnabled,
    experimentalFeaturesEnabled
} from "./enableExperimentalFeatures/experimentalFeaturesEnabled.reducer"
import { defaultLayoutAlgorithm, layoutAlgorithm } from "../../../mapState/store/layoutAlgorithm/layoutAlgorithm.reducer"
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
    isLoadingMap,
    resetCameraIfNewFileIsLoaded,
    isPresentationMode,
    experimentalFeaturesEnabled,
    screenshotToClipboardEnabled,
    layoutAlgorithm,
    maxTreeMapFiles,
    isColorMetricLinkedToHeightMetric
})

export const defaultAppSettings = {
    sortingOrderAscending: defaultSortingOrderAscending,
    isLoadingFile: defaultIsLoadingFile,
    isLoadingMap: defaultIsLoadingMap,
    resetCameraIfNewFileIsLoaded: defaultResetCameraIfNewFileIsLoaded,
    isPresentationMode: defaultIsPresentationMode,
    experimentalFeaturesEnabled: defaultExperimentalFeaturesEnabled,
    screenshotToClipboardEnabled: defaultScreenshotToClipboardEnabled,
    layoutAlgorithm: defaultLayoutAlgorithm,
    maxTreeMapFiles: defaultMaxTreeMapFiles,
    isColorMetricLinkedToHeightMetric: defaultIsColorMetricLinkedToHeightMetric
}
