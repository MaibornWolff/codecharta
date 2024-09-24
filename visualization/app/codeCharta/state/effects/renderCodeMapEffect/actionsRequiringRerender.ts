import { setAmountOfEdgePreviews } from "../../store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.actions"
import { setAmountOfTopLabels } from "../../store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { setColorLabels } from "../../store/appSettings/colorLabels/colorLabels.actions"
import { setEdgeHeight } from "../../store/appSettings/edgeHeight/edgeHeight.actions"
import { setHideFlatBuildings } from "../../store/appSettings/hideFlatBuildings/hideFlatBuildings.actions"
import { setInvertArea } from "../../store/appSettings/invertArea/invertArea.actions"
import { setInvertHeight } from "../../store/appSettings/invertHeight/invertHeight.actions"
import { setIsWhiteBackground } from "../../store/appSettings/isWhiteBackground/isWhiteBackground.actions"
import { setLayoutAlgorithm } from "../../store/appSettings/layoutAlgorithm/layoutAlgorithm.actions"
import { setMapColors, invertColorRange, invertDeltaColors } from "../../store/appSettings/mapColors/mapColors.actions"
import { setMaxTreeMapFiles } from "../../store/appSettings/maxTreeMapFiles/maxTreeMapFiles.actions"
import { setScaling } from "../../store/appSettings/scaling/scaling.actions"
import { setSharpnessMode } from "../../store/appSettings/sharpnessMode/sharpnessMode.actions"
import { setShowMetricLabelNameValue } from "../../store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.actions"
import { setShowMetricLabelNodeName } from "../../store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.actions"
import { setShowOnlyBuildingsWithEdges } from "../../store/appSettings/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.actions"
import { setAreaMetric } from "../../store/dynamicSettings/areaMetric/areaMetric.actions"
import { setColorMetric } from "../../store/dynamicSettings/colorMetric/colorMetric.actions"
import { setColorMode } from "../../store/dynamicSettings/colorMode/colorMode.actions"
import { setColorRange } from "../../store/dynamicSettings/colorRange/colorRange.actions"
import { setEdgeMetric } from "../../store/dynamicSettings/edgeMetric/edgeMetric.actions"
import { setHeightMetric } from "../../store/dynamicSettings/heightMetric/heightMetric.actions"
import { setMargin } from "../../store/dynamicSettings/margin/margin.actions"
import { setSearchPattern } from "../../store/dynamicSettings/searchPattern/searchPattern.actions"
import { setMarkedPackages, markPackages, unmarkPackage } from "../../store/fileSettings/markedPackages/markedPackages.actions"
import { setEnableFloorLabels } from "../../store/appSettings/enableFloorLabels/enableFloorLabels.actions"
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
    setAmountOfTopLabels,
    setLayoutAlgorithm,
    setMaxTreeMapFiles,
    setSharpnessMode,
    setColorMode,
    setEdgeMetric,
    setColorRange,
    setMargin,
    setSearchPattern,
    setHeightMetric,
    setAreaMetric,
    setColorMetric,
    setShowOnlyBuildingsWithEdges,
    setMarkedPackages,
    markPackages,
    unmarkPackage,
    setEnableFloorLabels,
    setState
]
