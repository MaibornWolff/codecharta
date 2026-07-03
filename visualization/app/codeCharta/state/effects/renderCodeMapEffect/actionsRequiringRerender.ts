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
} from "../../../mapState/mapState.write.facade"
import { setLayoutAlgorithm } from "../../../mapState/mapState.write.facade"
import { setMaxTreeMapFiles } from "../../../preferences/preferences.write.facade"
import { setAreaMetric, setColorMetric, setEdgeMetric, setHeightMetric } from "../../../mapState/mapState.write.facade"
import { setColorMode } from "../../../mapState/mapState.write.facade"
import { setColorRange } from "../../../mapState/mapState.write.facade"
import { setAllFocusedNodes, focusNode, unfocusAllNodes, unfocusNode, setSearchPattern } from "../../../sharedView/sharedView.write.facade"
import { setMargin } from "../../../mapState/mapState.write.facade"
import { setMarkedPackages, markPackages, unmarkPackage } from "../../../sharedView/sharedView.write.facade"
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
