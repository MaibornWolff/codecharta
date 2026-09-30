import { setCenterMapZoom } from "./centerMapZoom/centerMapZoom.actions"
import { setDependencyGraphSettings } from "./dependencyGraph/dependencyGraph.actions"
import { setDependencyViewEnabled } from "./dependencyViewEnabled/dependencyViewEnabled.actions"
import { setScreenshotToClipboardEnabled } from "./enableClipboard/screenshotToClipboardEnabled.actions"
import {
    setIsColorMetricLinkedToHeightMetricAction,
    toggleIsColorMetricLinkedToHeightMetric
} from "./isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.actions"
import { setPresentationMode } from "./isPresentationMode/isPresentationMode.actions"
import { setMaxTreeMapFiles } from "./maxTreeMapFiles/maxTreeMapFiles.actions"
import { setRadialFolderStyle } from "./radialFolderStyle/radialFolderStyle.actions"
import { setRadialFolderTint } from "./radialFolderTint/radialFolderTint.actions"
import { setRadialFolderValue } from "./radialFolderValue/radialFolderValue.actions"
import { setRadialLevels } from "./radialLevels/radialLevels.actions"
import { setResetCameraIfNewFileIsLoaded } from "./resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"
import { setSortingOption, toggleSortingOrderAscending } from "./sorting/sorting.actions"

// The durable-preference actions that trigger a CcState save (consumed by actionsRequiringSaveCcState).
export const preferencesActions = [
    setPresentationMode,
    setResetCameraIfNewFileIsLoaded,
    toggleSortingOrderAscending,
    setCenterMapZoom,
    setMaxTreeMapFiles,
    setScreenshotToClipboardEnabled,
    setIsColorMetricLinkedToHeightMetricAction,
    toggleIsColorMetricLinkedToHeightMetric,
    setSortingOption,
    setRadialFolderValue,
    setRadialFolderStyle,
    setRadialFolderTint,
    setRadialLevels,
    setDependencyGraphSettings,
    setDependencyViewEnabled
]
