// Plop: Append reducer import here
import { edgeMetric } from "./edgeMetric/edgeMetric.reducer"
import { colorRange } from "./colorRange/colorRange.reducer"
import { margin } from "./margin/margin.reducer"
import { searchPattern } from "./searchPattern/searchPattern.reducer"
import { searchedNodePaths } from "./searchedNodePaths/searchedNodePaths.reducer"
import { focusedNodePath } from "./focusedNodePath/focusedNodePath.reducer"
import { heightMetric } from "./heightMetric/heightMetric.reducer"
import { distributionMetric } from "./distributionMetric/distributionMetric.reducer"
import { colorMetric } from "./colorMetric/colorMetric.reducer"
import { areaMetric } from "./areaMetric/areaMetric.reducer"
import { DynamicSettingsActions } from "./dynamicSettings.actions"
import { DynamicSettings, CCAction } from "../../../codeCharta.model"
import { setEdgeMetric } from "./edgeMetric/edgeMetric.actions"
import { setColorRange } from "./colorRange/colorRange.actions"
import { setMargin } from "./margin/margin.actions"
import { setSearchPattern } from "./searchPattern/searchPattern.actions"
import { setSearchedNodePaths } from "./searchedNodePaths/searchedNodePaths.actions"
import { setDistributionMetric } from "./distributionMetric/distributionMetric.actions"
import { setColorMetric } from "./colorMetric/colorMetric.actions"
import { setAreaMetric } from "./areaMetric/areaMetric.actions"
import { setHeightMetric } from "./heightMetric/heightMetric.actions"
import { focusNode } from "./focusedNodePath/focusedNodePath.actions"

export default function dynamicSettings(state: DynamicSettings = {} as DynamicSettings, action: CCAction): DynamicSettings {
	// Plop: Append action declaration here
	let edgeMetricAction = action
	let colorRangeAction = action
	let marginAction = action
	let searchPatternAction = action
	let searchedNodePathsAction = action
	let focusedNodePathAction = action
	let heightMetricAction = action
	let distributionMetricAction = action
	let colorMetricAction = action
	let areaMetricAction = action

	if (action.type === DynamicSettingsActions.SET_DYNAMIC_SETTINGS) {
		// Plop: Append check for action payload here
		if (action.payload.edgeMetric) {
			edgeMetricAction = setEdgeMetric(action.payload.edgeMetric)
		}

		if (action.payload.colorRange) {
			colorRangeAction = setColorRange(action.payload.colorRange)
		}

		if (action.payload.margin) {
			marginAction = setMargin(action.payload.margin)
		}

		if (action.payload.searchPattern) {
			searchPatternAction = setSearchPattern(action.payload.searchPattern)
		}

		if (action.payload.searchedNodePaths) {
			searchedNodePathsAction = setSearchedNodePaths(action.payload.searchedNodePaths)
		}

		if (action.payload.focusedNodePath) {
			focusedNodePathAction = focusNode(action.payload.focusedNodePath)
		}

		if (action.payload.heightMetric) {
			heightMetricAction = setHeightMetric(action.payload.heightMetric)
		}

		if (action.payload.distributionMetric) {
			distributionMetricAction = setDistributionMetric(action.payload.distributionMetric)
		}

		if (action.payload.colorMetric) {
			colorMetricAction = setColorMetric(action.payload.colorMetric)
		}

		if (action.payload.areaMetric) {
			areaMetricAction = setAreaMetric(action.payload.areaMetric)
		}
	}

	return {
		// Plop: Append action forwarding here
		edgeMetric: edgeMetric(state.edgeMetric, edgeMetricAction),
		colorRange: colorRange(state.colorRange, colorRangeAction),
		margin: margin(state.margin, marginAction),
		searchPattern: searchPattern(state.searchPattern, searchPatternAction),
		searchedNodePaths: searchedNodePaths(state.searchedNodePaths, searchedNodePathsAction),
		focusedNodePath: focusedNodePath(state.focusedNodePath, focusedNodePathAction),
		heightMetric: heightMetric(state.heightMetric, heightMetricAction),
		distributionMetric: distributionMetric(state.distributionMetric, distributionMetricAction),
		colorMetric: colorMetric(state.colorMetric, colorMetricAction),
		areaMetric: areaMetric(state.areaMetric, areaMetricAction)
	}
}
