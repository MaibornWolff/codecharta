import {
    invertColorRange,
    invertDeltaColors,
    setAmountOfEdgePreviews,
    setAmountOfTopLabels,
    setColorLabels,
    setEdgeHeight,
    setEnableFloorLabels,
    setGroupLabelCollisions,
    setHideFlatBuildings,
    setInvertArea,
    setInvertHeight,
    setIsWhiteBackground,
    setLabelMode,
    setLabelSize,
    setLabelsPerMap,
    setMapColors,
    setScaling,
    setShowIncomingEdges,
    setShowMetricLabelNameValue,
    setShowMetricLabelNodeName,
    setShowOnlyBuildingsWithEdges,
    setShowOutgoingEdges
} from "../../../mapState/mapState.facade"
import { setLayoutAlgorithm } from "../../../mapState/store/layoutAlgorithm/layoutAlgorithm.actions"
import { setMaxTreeMapFiles } from "../../store/appSettings/maxTreeMapFiles/maxTreeMapFiles.actions"
import { setAreaMetric, setColorMetric, setEdgeMetric, setHeightMetric } from "../../../mapState/mapState.facade"
import { setColorMode } from "../../../mapState/store/colorMode/colorMode.actions"
import { setColorRange } from "../../../mapState/store/colorRange/colorRange.actions"
import { setAllFocusedNodes, focusNode, unfocusAllNodes, unfocusNode, setSearchPattern } from "../../../sharedView/sharedView.facade"
import { setMargin } from "../../../mapState/store/margin/margin.actions"
import { setMarkedPackages, markPackages, unmarkPackage } from "../../../sharedView/sharedView.facade"
import { setState } from "../../store/state.actions"

export const actionsRequiringRerender = [
    setColorLabels,
    setMapColors,
    invertColorRange,
    invertDeltaColors,
    setShowMetricLabelNodeName,
    setShowMetricLabelNameValue,
    setIsWhiteBackground,
    setInvertArea,
    setInvertHeight,
    setHideFlatBuildings,
    setScaling,
    setEdgeHeight,
    setAmountOfEdgePreviews,
    setShowIncomingEdges,
    setShowOutgoingEdges,
    setAmountOfTopLabels,
    setLabelSize,
    setLayoutAlgorithm,
    setMaxTreeMapFiles,
    setColorMode,
    setEdgeMetric,
    setColorRange,
    setMargin,
    setSearchPattern,
    setAllFocusedNodes,
    focusNode,
    unfocusAllNodes,
    unfocusNode,
    setHeightMetric,
    setAreaMetric,
    setColorMetric,
    setShowOnlyBuildingsWithEdges,
    setMarkedPackages,
    markPackages,
    unmarkPackage,
    setEnableFloorLabels,
    setGroupLabelCollisions,
    setLabelsPerMap,
    setLabelMode,
    setState
]
