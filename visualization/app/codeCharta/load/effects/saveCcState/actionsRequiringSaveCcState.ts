import { fileActions } from "../../../stores/fileStore/fileStore.facade"
import {
    invertColorRange,
    invertDeltaColors,
    setAmountOfEdgePreviews,
    setAmountOfTopLabels,
    setAreaMetric,
    setColorLabels,
    setColorMetric,
    setColorMode,
    setColorRange,
    setDistributionMetric,
    setEdgeHeight,
    setEdgeMetric,
    setEnableFloorLabels,
    setGroupLabelCollisions,
    setHeightMetric,
    setHideFlatBuildings,
    setInvertArea,
    setInvertHeight,
    setIsEdgeMetricVisible,
    setIsWhiteBackground,
    setLabelMode,
    setLabelSize,
    setLabelsPerMap,
    setLayoutAlgorithm,
    setMapColors,
    setMargin,
    setScaling,
    setShowIncomingEdges,
    setShowMetricLabelNameValue,
    setShowMetricLabelNodeName,
    setShowOnlyBuildingsWithEdges,
    setShowOutgoingEdges,
    toggleEdgeMetricVisible
} from "../../../stores/mapState/mapState.write.facade"
import { setAttributeDescriptors, setAttributeTypes } from "../../../stores/metricsLensSource/metricsLensSource.write.facade"
import { preferencesActions } from "../../../stores/preferences/preferences.write.facade"
import { setState } from "../../../stores/rootStore/state.actions"
import {
    addBlacklistItem,
    addBlacklistItems,
    focusNode,
    markPackages,
    removeBlacklistItem,
    removeBlacklistItems,
    setAllFocusedNodes,
    setBlacklist,
    setMarkedPackages,
    setSearchPattern,
    unfocusAllNodes,
    unfocusNode,
    unmarkPackage
} from "../../../stores/sharedView/sharedView.write.facade"

const mapStateSaveActions = [
    setColorLabels,
    setShowMetricLabelNodeName,
    setShowMetricLabelNameValue,
    setMapColors,
    invertColorRange,
    invertDeltaColors,
    setShowOnlyBuildingsWithEdges,
    setShowIncomingEdges,
    setShowOutgoingEdges,
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
    removeBlacklistItems,
    setMarkedPackages,
    markPackages,
    unmarkPackage
]

const metricsLensSaveActions = [setAttributeTypes, setAttributeDescriptors]

export const actionsRequiringSaveCcState = [
    [...metricsLensSaveActions],
    [...mapStateSaveActions],
    [...sharedViewSaveActions],
    [...preferencesActions],
    [...fileActions],
    setState
].flat()
