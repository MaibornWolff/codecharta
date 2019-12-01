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
	switch (action.type) {
		case DynamicSettingsActions.SET_DYNAMIC_SETTINGS:
			return {
				edgeMetric: edgeMetric(state.edgeMetric, setEdgeMetric(action.payload.edgeMetric)),
				colorRange: colorRange(state.colorRange, setColorRange(action.payload.colorRange)),
				margin: margin(state.margin, setMargin(action.payload.margin)),
				searchPattern: searchPattern(state.searchPattern, setSearchPattern(action.payload.searchPattern)),
				searchedNodePaths: searchedNodePaths(state.searchedNodePaths, setSearchedNodePaths(action.payload.searchedNodePaths)),
				focusedNodePath: focusedNodePath(state.focusedNodePath, focusNode(action.payload.focusedNodePath)),
				heightMetric: heightMetric(state.heightMetric, setHeightMetric(action.payload.heightMetric)),
				distributionMetric: distributionMetric(state.distributionMetric, setDistributionMetric(action.payload.distributionMetric)),
				colorMetric: colorMetric(state.colorMetric, setColorMetric(action.payload.colorMetric)),
				areaMetric: areaMetric(state.areaMetric, setAreaMetric(action.payload.areaMetric))
			}
		default:
			return {
				edgeMetric: edgeMetric(state.edgeMetric, action),
				colorRange: colorRange(state.colorRange, action),
				margin: margin(state.margin, action),
				searchPattern: searchPattern(state.searchPattern, action),
				searchedNodePaths: searchedNodePaths(state.searchedNodePaths, action),
				focusedNodePath: focusedNodePath(state.focusedNodePath, action),
				heightMetric: heightMetric(state.heightMetric, action),
				distributionMetric: distributionMetric(state.distributionMetric, action),
				colorMetric: colorMetric(state.colorMetric, action),
				areaMetric: areaMetric(state.areaMetric, action)
			}
	}
}
