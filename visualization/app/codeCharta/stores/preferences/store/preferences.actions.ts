import { setScreenshotToClipboardEnabled } from "./enableClipboard/screenshotToClipboardEnabled.actions"
import { setExperimentalFeaturesEnabled } from "./enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import {
    setIsColorMetricLinkedToHeightMetricAction,
    toggleIsColorMetricLinkedToHeightMetric
} from "./isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.actions"
import { setPresentationMode } from "./isPresentationMode/isPresentationMode.actions"
import { setMaxTreeMapFiles } from "./maxTreeMapFiles/maxTreeMapFiles.actions"
import { setResetCameraIfNewFileIsLoaded } from "./resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"
import { setSortingOption, toggleSortingOrderAscending } from "./sorting/sorting.actions"

// The durable-preference actions that trigger a CcState save (consumed by actionsRequiringSaveCcState).
export const preferencesActions = [
    setPresentationMode,
    setResetCameraIfNewFileIsLoaded,
    toggleSortingOrderAscending,
    setMaxTreeMapFiles,
    setExperimentalFeaturesEnabled,
    setScreenshotToClipboardEnabled,
    setIsColorMetricLinkedToHeightMetricAction,
    toggleIsColorMetricLinkedToHeightMetric,
    setSortingOption
]
