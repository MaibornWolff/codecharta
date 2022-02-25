import { isActionOfType } from "../../../../util/reduxHelper"
import { HoveredBuildingPathActions } from "../../appStatus/hoveredBuildingPath/hoveredBuildingPath.actions"
import { FocusedNodePathActions } from "../../dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { SortingOptionActions } from "../../dynamicSettings/sortingOption/sortingOption.actions"
import { CameraTargetActions } from "../cameraTarget/cameraTarget.actions"
import { CameraActions } from "../../appSettings/camera/camera.actions"
import { ScreenshotToClipboardEnabledActions } from "../enableClipboard/screenshotToClipboardEnabled.actions"
import { ExperimentalFeaturesEnabledActions } from "../enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { IsAttributeSideBarVisibleActions } from "../isAttributeSideBarVisible/isAttributeSideBarVisible.actions"
import { IsLoadingFileActions } from "../isLoadingFile/isLoadingFile.actions"
import { PresentationModeActions } from "../isPresentationMode/isPresentationMode.actions"
import { PanelSelectionActions } from "../panelSelection/panelSelection.actions"
import { SearchPanelModeActions } from "../searchPanelMode/searchPanelMode.actions"
import { SortingOrderAscendingActions } from "../sortingOrderAscending/sortingOrderAscending.actions"
import { IsLoadingMapAction, IsLoadingMapActions, setIsLoadingMap } from "./isLoadingMap.actions"
import { RightClickedNodeDataActions } from "../../appStatus/rightClickedNodeData/rightClickedNodeData.actions"
import { IsEdgeMetricVisibleActions } from "../isEdgeMetricVisible/isEdgeMetricVisible.actions"

// Todo state actions explicit instead of excluding all others; refs #1547
const actionsToExclude = [
	IsLoadingMapActions,
	IsLoadingFileActions,
	SortingOrderAscendingActions,
	SearchPanelModeActions,
	SortingOptionActions,
	IsAttributeSideBarVisibleActions,
	PanelSelectionActions,
	PresentationModeActions,
	ExperimentalFeaturesEnabledActions,
	IsEdgeMetricVisibleActions,
	ScreenshotToClipboardEnabledActions,
	HoveredBuildingPathActions,
	RightClickedNodeDataActions,
	FocusedNodePathActions,
	CameraTargetActions,
	CameraActions
]

export function isLoadingMap(state = setIsLoadingMap().payload, action: IsLoadingMapAction) {
	if (action.type === IsLoadingMapActions.SET_IS_LOADING_MAP) return action.payload

	if (actionsToExclude.every(excludeActions => !isActionOfType(action.type, excludeActions))) return true

	return state
}
