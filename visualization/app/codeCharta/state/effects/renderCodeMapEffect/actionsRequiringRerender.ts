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
import { setAreaMetric } from "../../store/dynamicSettings/areaMetric/areaMetric.actions"
import { setColorMetric } from "../../store/dynamicSettings/colorMetric/colorMetric.actions"
import { setColorMode } from "../../../mapState/store/colorMode/colorMode.actions"
import { setColorRange } from "../../../mapState/store/colorRange/colorRange.actions"
import { setEdgeMetric } from "../../store/dynamicSettings/edgeMetric/edgeMetric.actions"
import {
    setAllFocusedNodes,
    focusNode,
    unfocusAllNodes,
    unfocusNode
} from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { setHeightMetric } from "../../store/dynamicSettings/heightMetric/heightMetric.actions"
import { setMargin } from "../../../mapState/store/margin/margin.actions"
import { setSearchPattern } from "../../store/dynamicSettings/searchPattern/searchPattern.actions"
import { setMarkedPackages, markPackages, unmarkPackage } from "../../store/fileSettings/markedPackages/markedPackages.actions"
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
