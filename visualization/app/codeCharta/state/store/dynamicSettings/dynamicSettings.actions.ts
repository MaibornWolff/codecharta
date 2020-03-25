import { CCAction, DynamicSettings, RecursivePartial } from "../../../codeCharta.model"

// Plop: Append default property import here
import { defaultSortingOption } from "./sortingOption/sortingOption.actions"
import { defaultAreaMetric } from "./areaMetric/areaMetric.actions"
import { defaultColorMetric } from "./colorMetric/colorMetric.actions"
import { defaultColorRange } from "./colorRange/colorRange.actions"
import { defaultDistributionMetric } from "./distributionMetric/distributionMetric.actions"
import { defaultEdgeMetric } from "./edgeMetric/edgeMetric.actions"
import { defaultFocusedNodePath } from "./focusedNodePath/focusedNodePath.actions"
import { defaultHeightMetric } from "./heightMetric/heightMetric.actions"
import { defaultMargin } from "./margin/margin.actions"
import { defaultSearchedNodePaths } from "./searchedNodePaths/searchedNodePaths.actions"
import { defaultSearchPattern } from "./searchPattern/searchPattern.actions"

export enum DynamicSettingsActions {
	SET_DYNAMIC_SETTINGS = "SET_DYNAMIC_SETTINGS"
}

export interface SetDynamicSettingsAction extends CCAction {
	type: DynamicSettingsActions.SET_DYNAMIC_SETTINGS
	payload: RecursivePartial<DynamicSettings>
}

export type DynamicSettingsAction = SetDynamicSettingsAction

export function setDynamicSettings(dynamicSettings: RecursivePartial<DynamicSettings> = defaultDynamicSettings): DynamicSettingsAction {
	return {
		type: DynamicSettingsActions.SET_DYNAMIC_SETTINGS,
		payload: dynamicSettings
	}
}

export const defaultDynamicSettings: DynamicSettings = {
	// Plop: Append default property here
	sortingOption: defaultSortingOption,
	areaMetric: defaultAreaMetric,
	heightMetric: defaultHeightMetric,
	colorMetric: defaultColorMetric,
	distributionMetric: defaultDistributionMetric,
	edgeMetric: defaultEdgeMetric,
	focusedNodePath: defaultFocusedNodePath,
	searchedNodePaths: defaultSearchedNodePaths,
	searchPattern: defaultSearchPattern,
	margin: defaultMargin,
	colorRange: defaultColorRange
}
