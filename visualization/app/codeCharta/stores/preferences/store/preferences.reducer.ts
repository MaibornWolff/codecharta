import { combineReducers } from "@ngrx/store"
import { centerMapZoom, defaultCenterMapZoom } from "./centerMapZoom/centerMapZoom.reducer"
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
import { defaultRadialFolderStyle, radialFolderStyle } from "./radialFolderStyle/radialFolderStyle.reducer"
import { defaultRadialFolderTint, radialFolderTint } from "./radialFolderTint/radialFolderTint.reducer"
import { defaultRadialFolderValue, radialFolderValue } from "./radialFolderValue/radialFolderValue.reducer"
import { defaultRadialLevels, radialLevels } from "./radialLevels/radialLevels.reducer"
import {
    defaultResetCameraIfNewFileIsLoaded,
    resetCameraIfNewFileIsLoaded
} from "./resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.reducer"
import { defaultSorting, sorting } from "./sorting/sorting.reducer"

export const preferences = combineReducers({
    isPresentationMode,
    resetCameraIfNewFileIsLoaded,
    centerMapZoom,
    maxTreeMapFiles,
    experimentalFeaturesEnabled,
    screenshotToClipboardEnabled,
    isColorMetricLinkedToHeightMetric,
    sorting,
    radialFolderValue,
    radialFolderStyle,
    radialFolderTint,
    radialLevels
})

export const defaultPreferences = {
    isPresentationMode: defaultIsPresentationMode,
    resetCameraIfNewFileIsLoaded: defaultResetCameraIfNewFileIsLoaded,
    centerMapZoom: defaultCenterMapZoom,
    maxTreeMapFiles: defaultMaxTreeMapFiles,
    experimentalFeaturesEnabled: defaultExperimentalFeaturesEnabled,
    screenshotToClipboardEnabled: defaultScreenshotToClipboardEnabled,
    isColorMetricLinkedToHeightMetric: defaultIsColorMetricLinkedToHeightMetric,
    sorting: defaultSorting,
    radialFolderValue: defaultRadialFolderValue,
    radialFolderStyle: defaultRadialFolderStyle,
    radialFolderTint: defaultRadialFolderTint,
    radialLevels: defaultRadialLevels
}
