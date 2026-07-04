import { fileActions } from "../../../fileStore/store/files.actions"
import { setState } from "../../../state/store/state.actions"
import { preferencesActions } from "../../../preferences/preferences.write.facade"
import { setAttributeTypes, setAttributeDescriptors } from "../../../lenses/metrics/metricsLens.load.facade"
import {
    setColorLabels,
    setShowMetricLabelNodeName,
    setShowMetricLabelNameValue,
    setMapColors,
    invertColorRange,
    invertDeltaColors,
    setShowOnlyBuildingsWithEdges,
    setIsEdgeMetricVisible,
    toggleEdgeMetricVisible,
    setIsWhiteBackground,
    setInvertHeight,
    setInvertArea,
    setHideFlatBuildings,
    setScaling,
    setEdgeHeight,
    setAmountOfEdgePreviews,
    setAmountOfTopLabels,
    setLabelSize,
    setLayoutAlgorithm,
    setEnableFloorLabels,
    setLabelMode,
    setGroupLabelCollisions,
    setLabelsPerMap,
    setColorMode,
    setEdgeMetric,
    setColorRange,
    setMargin,
    setHeightMetric,
    setDistributionMetric,
    setColorMetric,
    setAreaMetric
} from "../../../mapState/mapState.write.facade"
import {
    setSearchPattern,
    setAllFocusedNodes,
    unfocusAllNodes,
    focusNode,
    unfocusNode,
    setBlacklist,
    addBlacklistItem,
    addBlacklistItems,
    removeBlacklistItem,
    setMarkedPackages,
    markPackages,
    unmarkPackage
} from "../../../sharedView/sharedView.write.facade"

// Slice 10b: the ex-appSettings / ex-dynamicSettings grab-bag action lists (appSettingsActions,
// dynamicSettingsActions) were dissolved together with those reducers. The exact set of actions that
// trigger a CcState save is preserved, now grouped by the state home each action belongs to — mapState
// (view settings), sharedView (focus/search) and preferences (durable prefs). The fileStore setStandard
// action that used to sit in dynamicSettingsActions is already covered by fileActions.
const mapStateSaveActions = [
    setColorLabels,
    setShowMetricLabelNodeName,
    setShowMetricLabelNameValue,
    setMapColors,
    invertColorRange,
    invertDeltaColors,
    setShowOnlyBuildingsWithEdges,
    setIsEdgeMetricVisible,
    toggleEdgeMetricVisible,
    setIsWhiteBackground,
    setInvertHeight,
    setInvertArea,
    setHideFlatBuildings,
    setScaling,
    setEdgeHeight,
    setAmountOfEdgePreviews,
    setAmountOfTopLabels,
    setLabelSize,
    setLayoutAlgorithm,
    setEnableFloorLabels,
    setLabelMode,
    setGroupLabelCollisions,
    setLabelsPerMap,
    setColorMode,
    setEdgeMetric,
    setColorRange,
    setMargin,
    setHeightMetric,
    setDistributionMetric,
    setColorMetric,
    setAreaMetric
]

// Slice 9b/9c re-homed blacklist + markedPackages from the (now-deleted) fileSettings slice into
// sharedView; their save-trigger actions belong here with the rest of the sharedView save actions.
const sharedViewSaveActions = [
    setSearchPattern,
    setAllFocusedNodes,
    unfocusAllNodes,
    focusNode,
    unfocusNode,
    setBlacklist,
    addBlacklistItem,
    addBlacklistItems,
    removeBlacklistItem,
    setMarkedPackages,
    markPackages,
    unmarkPackage
]

// The metrics lens's cc.json source (node attributeTypes + descriptors) persists in the CcState blob.
// Slice 15e removed the edge actions (setEdges/addEdge/removeEdge) from the save-trigger union entirely:
// edges is no longer stored state (a pure derived selector on the dependency lens), so nothing about it
// needs persisting.
const metricsLensSaveActions = [setAttributeTypes, setAttributeDescriptors]

export const actionsRequiringSaveCcState = [
    [...metricsLensSaveActions],
    [...mapStateSaveActions],
    [...sharedViewSaveActions],
    [...preferencesActions],
    [...fileActions],
    setState
].flat()
