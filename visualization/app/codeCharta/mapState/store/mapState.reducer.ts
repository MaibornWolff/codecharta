import { combineReducers } from "@ngrx/store"
import { MapState } from "../../codeCharta.model"
import { colorMode, defaultColorMode } from "./colorMode/colorMode.reducer"
import { colorRange, defaultColorRange } from "./colorRange/colorRange.reducer"
import { defaultMargin, margin } from "./margin/margin.reducer"
import { defaultLayoutAlgorithm, layoutAlgorithm } from "./layoutAlgorithm/layoutAlgorithm.reducer"
import { defaultIsLoadingMap, isLoadingMap } from "./isLoadingMap/isLoadingMap.reducer"
import { defaultHoveredNodeId, hoveredNodeId } from "./hoveredNodeId/hoveredNodeId.reducer"
import { defaultRightClickedNodeData, rightClickedNodeData } from "./rightClickedNodeData/rightClickedNodeData.reducer"
import { defaultSelectedBuildingId, selectedBuildingId } from "./selectedBuildingId/selectedBuildingId.reducer"
import { amountOfEdgePreviews, defaultAmountOfEdgesPreviews } from "./amountOfEdgePreviews/amountOfEdgePreviews.reducer"
import { amountOfTopLabels, defaultAmountOfTopLabels } from "./amountOfTopLabels/amountOfTopLabels.reducer"
import { colorLabels, defaultColorLabelOptions } from "./colorLabels/colorLabels.reducer"
import { defaultEdgeHeight, edgeHeight } from "./edgeHeight/edgeHeight.reducer"
import { defaultEnableFloorLabels, enableFloorLabels } from "./enableFloorLabels/enableFloorLabels.reducer"
import { defaultGroupLabelCollisions, groupLabelCollisions } from "./groupLabelCollisions/groupLabelCollisions.reducer"
import { defaultHideFlatBuildings, hideFlatBuildings } from "./hideFlatBuildings/hideFlatBuildings.reducer"
import { defaultInvertArea, invertArea } from "./invertArea/invertArea.reducer"
import { defaultInvertHeight, invertHeight } from "./invertHeight/invertHeight.reducer"
import { defaultIsEdgeMetricVisible, isEdgeMetricVisible } from "./isEdgeMetricVisible/isEdgeMetricVisible.reducer"
import { defaultIsWhiteBackground, isWhiteBackground } from "./isWhiteBackground/isWhiteBackground.reducer"
import { defaultLabelMode, labelMode } from "./labelMode/labelMode.reducer"
import { defaultLabelSize, labelSize } from "./labelSize/labelSize.reducer"
import { defaultLabelsPerMap, labelsPerMap } from "./labelsPerMap/labelsPerMap.reducer"
import { defaultMapColors, mapColors } from "./mapColors/mapColors.reducer"
import { defaultScaling, scaling } from "./scaling/scaling.reducer"
import { defaultShowIncomingEdges, showIncomingEdges } from "./showEdges/incoming/showIncomingEdges.reducer"
import { defaultShowOutgoingEdges, showOutgoingEdges } from "./showEdges/outgoing/showOutgoingEdges.reducer"
import { defaultShowMetricLabelNameValue, showMetricLabelNameValue } from "./showMetricLabelNameValue/showMetricLabelNameValue.reducer"
import { defaultShowMetricLabelNodeName, showMetricLabelNodeName } from "./showMetricLabelNodeName/showMetricLabelNodeName.reducer"
import { defaultShowOnlyBuildingsWithEdges, showOnlyBuildingsWithEdges } from "./showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.reducer"

export const mapState = combineReducers({
    colorLabels,
    showMetricLabelNodeName,
    showMetricLabelNameValue,
    mapColors,
    showIncomingEdges,
    showOutgoingEdges,
    showOnlyBuildingsWithEdges,
    isEdgeMetricVisible,
    isWhiteBackground,
    invertHeight,
    invertArea,
    hideFlatBuildings,
    scaling,
    edgeHeight,
    amountOfEdgePreviews,
    amountOfTopLabels,
    labelSize,
    enableFloorLabels,
    labelMode,
    groupLabelCollisions,
    labelsPerMap,
    colorMode,
    colorRange,
    margin,
    layoutAlgorithm,
    isLoadingMap,
    hoveredNodeId,
    selectedBuildingId,
    rightClickedNodeData
})

export const defaultMapState: MapState = {
    colorLabels: defaultColorLabelOptions,
    showMetricLabelNodeName: defaultShowMetricLabelNodeName,
    showMetricLabelNameValue: defaultShowMetricLabelNameValue,
    mapColors: defaultMapColors,
    showIncomingEdges: defaultShowIncomingEdges,
    showOutgoingEdges: defaultShowOutgoingEdges,
    showOnlyBuildingsWithEdges: defaultShowOnlyBuildingsWithEdges,
    isEdgeMetricVisible: defaultIsEdgeMetricVisible,
    isWhiteBackground: defaultIsWhiteBackground,
    invertHeight: defaultInvertHeight,
    invertArea: defaultInvertArea,
    hideFlatBuildings: defaultHideFlatBuildings,
    scaling: defaultScaling,
    edgeHeight: defaultEdgeHeight,
    amountOfEdgePreviews: defaultAmountOfEdgesPreviews,
    amountOfTopLabels: defaultAmountOfTopLabels,
    labelSize: defaultLabelSize,
    enableFloorLabels: defaultEnableFloorLabels,
    labelMode: defaultLabelMode,
    groupLabelCollisions: defaultGroupLabelCollisions,
    labelsPerMap: defaultLabelsPerMap,
    colorMode: defaultColorMode,
    colorRange: defaultColorRange,
    margin: defaultMargin,
    layoutAlgorithm: defaultLayoutAlgorithm,
    isLoadingMap: defaultIsLoadingMap,
    hoveredNodeId: defaultHoveredNodeId,
    selectedBuildingId: defaultSelectedBuildingId,
    rightClickedNodeData: defaultRightClickedNodeData
}
