import { isActionOfType } from "../../../../util/reduxHelper"
import { HoveredNodeIdActions } from "../../appStatus/hoveredNodeId/hoveredNodeId.actions"
import { FocusedNodePathActions } from "../../dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { SortingOptionActions } from "../../dynamicSettings/sortingOption/sortingOption.actions"
import { ScreenshotToClipboardEnabledActions } from "../enableClipboard/screenshotToClipboardEnabled.actions"
import { ExperimentalFeaturesEnabledActions } from "../enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { IsAttributeSideBarVisibleActions } from "../isAttributeSideBarVisible/isAttributeSideBarVisible.actions"
import { IsLoadingFileActions } from "../isLoadingFile/isLoadingFile.actions"
import { PresentationModeActions } from "../isPresentationMode/isPresentationMode.actions"
import { SortingOrderAscendingActions } from "../sortingOrderAscending/sortingOrderAscending.actions"
import { IsLoadingMapAction, IsLoadingMapActions, setIsLoadingMap } from "./isLoadingMap.actions"
import { RightClickedNodeDataActions } from "../../appStatus/rightClickedNodeData/rightClickedNodeData.actions"
import { IsEdgeMetricVisibleActions } from "../isEdgeMetricVisible/isEdgeMetricVisible.actions"

// Todo state actions explicit instead of excluding all others; refs #1547
const actionsToExclude = [
	IsLoadingMapActions,
	IsLoadingFileActions,
	SortingOrderAscendingActions,
	SortingOptionActions,
	IsAttributeSideBarVisibleActions,
	PresentationModeActions,
	ExperimentalFeaturesEnabledActions,
	IsEdgeMetricVisibleActions,
	ScreenshotToClipboardEnabledActions,
	HoveredNodeIdActions,
	RightClickedNodeDataActions,
	FocusedNodePathActions
]

export function isLoadingMap(state = setIsLoadingMap().payload, action: IsLoadingMapAction) {
	if (action.type === IsLoadingMapActions.SET_IS_LOADING_MAP) {
		return action.payload
	}

	if (actionsToExclude.every(excludeActions => !isActionOfType(action.type, excludeActions))) {
		return true
	}

	return state
}
