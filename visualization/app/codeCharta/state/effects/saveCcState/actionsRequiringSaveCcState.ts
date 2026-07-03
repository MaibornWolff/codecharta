import { fileSettingsActions } from "../../store/fileSettings/fileSettings.actions"
import { fileActions } from "../../../fileStore/store/files.actions"
import { setState } from "../../store/state.actions"
import { preferencesActions } from "../../../preferences/preferences.write.facade"
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
} from "../../../mapState/mapState.facade"
import { setSearchPattern, setAllFocusedNodes, unfocusAllNodes, focusNode, unfocusNode } from "../../../sharedView/sharedView.write.facade"

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

const sharedViewSaveActions = [setSearchPattern, setAllFocusedNodes, unfocusAllNodes, focusNode, unfocusNode]

export const actionsRequiringSaveCcState = [
    [...fileSettingsActions],
    [...mapStateSaveActions],
    [...sharedViewSaveActions],
    [...preferencesActions],
    [...fileActions],
    setState
].flat()
