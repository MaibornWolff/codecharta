import { setPresentationMode } from "./isPresentationMode/isPresentationMode.actions"
import { setResetCameraIfNewFileIsLoaded } from "./resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"
import { setSortingOrderAscending, toggleSortingOrderAscending } from "./sorting/sortingOrderAscending.actions"
import { setMaxTreeMapFiles } from "./maxTreeMapFiles/maxTreeMapFiles.actions"
import { setExperimentalFeaturesEnabled } from "./enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { setScreenshotToClipboardEnabled } from "./enableClipboard/screenshotToClipboardEnabled.actions"
import {
    setIsColorMetricLinkedToHeightMetricAction,
    toggleIsColorMetricLinkedToHeightMetric
} from "./isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.actions"
import { setSortingOption } from "./sorting/sorting.actions"

// The durable-preference actions that trigger a CcState save (consumed by actionsRequiringSaveCcState).
export const preferencesActions = [
    setPresentationMode,
    setResetCameraIfNewFileIsLoaded,
    setSortingOrderAscending,
    toggleSortingOrderAscending,
    setMaxTreeMapFiles,
    setExperimentalFeaturesEnabled,
    setScreenshotToClipboardEnabled,
    setIsColorMetricLinkedToHeightMetricAction,
    toggleIsColorMetricLinkedToHeightMetric,
    setSortingOption
]
