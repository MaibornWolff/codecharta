import { RecursivePartial, DynamicSettings, CCAction, ColorRange } from "../../../codeCharta.model"

import { splitColorModeAction } from "./colorMode/colorMode.splitter"
import { splitSortingOptionAction } from "./sortingOption/sortingOption.splitter"
import { splitEdgeMetricAction } from "./edgeMetric/edgeMetric.splitter"
import { splitColorRangeAction } from "./colorRange/colorRange.splitter"
import { splitMarginAction } from "./margin/margin.splitter"
import { splitSearchPatternAction } from "./searchPattern/searchPattern.splitter"
import { splitHeightMetricAction } from "./heightMetric/heightMetric.splitter"
import { splitDistributionMetricAction } from "./distributionMetric/distributionMetric.splitter"
import { splitColorMetricAction } from "./colorMetric/colorMetric.splitter"
import { splitAreaMetricAction } from "./areaMetric/areaMetric.splitter"
import { setAllFocusedNodes } from "./focusedNodePath/focusedNodePath.actions"

export function splitDynamicSettingsActions(payload: RecursivePartial<DynamicSettings>) {
	const actions: CCAction[] = []

	if (payload.colorMode !== undefined) {
		actions.push(splitColorModeAction(payload.colorMode))
	}

	if (payload.sortingOption !== undefined) {
		actions.push(splitSortingOptionAction(payload.sortingOption))
	}

	if (payload.edgeMetric !== undefined) {
		actions.push(splitEdgeMetricAction(payload.edgeMetric))
	}

	if (payload.colorRange !== undefined) {
		actions.push(splitColorRangeAction(payload.colorRange as ColorRange))
	}

	if (payload.margin !== undefined) {
		actions.push(splitMarginAction(payload.margin))
	}

	if (payload.searchPattern !== undefined) {
		actions.push(splitSearchPatternAction(payload.searchPattern))
	}

	if (payload.focusedNodePath !== undefined) {
		actions.push(setAllFocusedNodes(payload.focusedNodePath))
	}

	if (payload.heightMetric !== undefined) {
		actions.push(splitHeightMetricAction(payload.heightMetric))
	}

	if (payload.distributionMetric !== undefined) {
		actions.push(splitDistributionMetricAction(payload.distributionMetric))
	}

	if (payload.colorMetric !== undefined) {
		actions.push(splitColorMetricAction(payload.colorMetric))
	}

	if (payload.areaMetric !== undefined) {
		actions.push(splitAreaMetricAction(payload.areaMetric))
	}

	return actions
}
