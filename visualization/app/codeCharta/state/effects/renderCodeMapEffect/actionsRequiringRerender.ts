import { AmountOfEdgePreviewsActions } from "../../store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.actions"
import { AmountOfTopLabelsActions } from "../../store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { ColorLabelsActions } from "../../store/appSettings/colorLabels/colorLabels.actions"
import { EdgeHeightActions } from "../../store/appSettings/edgeHeight/edgeHeight.actions"
import { HideFlatBuildingsActions } from "../../store/appSettings/hideFlatBuildings/hideFlatBuildings.actions"
import { InvertAreaActions } from "../../store/appSettings/invertArea/invertArea.actions"
import { InvertHeightActions } from "../../store/appSettings/invertHeight/invertHeight.actions"
import { IsWhiteBackgroundActions } from "../../store/appSettings/isWhiteBackground/isWhiteBackground.actions"
import { LayoutAlgorithmActions } from "../../store/appSettings/layoutAlgorithm/layoutAlgorithm.actions"
import { MapColorsActions } from "../../store/appSettings/mapColors/mapColors.actions"
import { MaxTreeMapFilesActions } from "../../store/appSettings/maxTreeMapFiles/maxTreeMapFiles.actions"
import { ScalingActions } from "../../store/appSettings/scaling/scaling.actions"
import { SharpnessModeActions } from "../../store/appSettings/sharpnessMode/sharpnessMode.actions"
import { ShowMetricLabelNameValueActions } from "../../store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.actions"
import { ShowMetricLabelNodeNameActions } from "../../store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.actions"
import { ShowOnlyBuildingsWithEdgesActions } from "../../store/appSettings/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.actions"
import { AreaMetricActions } from "../../store/dynamicSettings/areaMetric/areaMetric.actions"
import { ColorMetricActions } from "../../store/dynamicSettings/colorMetric/colorMetric.actions"
import { ColorModeActions } from "../../store/dynamicSettings/colorMode/colorMode.actions"
import { ColorRangeActions } from "../../store/dynamicSettings/colorRange/colorRange.actions"
import { EdgeMetricActions } from "../../store/dynamicSettings/edgeMetric/edgeMetric.actions"
import { FocusedNodePathActions } from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { HeightMetricActions } from "../../store/dynamicSettings/heightMetric/heightMetric.actions"
import { MarginActions } from "../../store/dynamicSettings/margin/margin.actions"
import { SearchPatternActions } from "../../store/dynamicSettings/searchPattern/searchPattern.actions"

export const actionsRequiringRerender = [
	ColorLabelsActions,
	MapColorsActions,
	ShowMetricLabelNodeNameActions,
	ShowMetricLabelNameValueActions,
	IsWhiteBackgroundActions,
	InvertAreaActions,
	InvertHeightActions,
	HideFlatBuildingsActions,
	ScalingActions,
	EdgeHeightActions,
	AmountOfEdgePreviewsActions,
	AmountOfTopLabelsActions,
	LayoutAlgorithmActions,
	MaxTreeMapFilesActions,
	SharpnessModeActions,
	ColorModeActions,
	EdgeMetricActions,
	ColorRangeActions,
	MarginActions,
	SearchPatternActions,
	FocusedNodePathActions,
	HeightMetricActions,
	AreaMetricActions,
	ColorMetricActions,
	ShowOnlyBuildingsWithEdgesActions
]
