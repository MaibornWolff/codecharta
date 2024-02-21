import { setStandard } from "../files/files.actions"
import { setAreaMetric } from "./areaMetric/areaMetric.actions"
import { setColorMetric } from "./colorMetric/colorMetric.actions"
import { setColorMode } from "./colorMode/colorMode.actions"
import { setColorRange } from "./colorRange/colorRange.actions"
import { setDistributionMetric } from "./distributionMetric/distributionMetric.actions"
import { setEdgeMetric } from "./edgeMetric/edgeMetric.actions"
import { setAllFocusedNodes, unfocusAllNodes, focusNode, unfocusNode } from "./focusedNodePath/focusedNodePath.actions"
import { setHeightMetric } from "./heightMetric/heightMetric.actions"
import { setMargin } from "./margin/margin.actions"
import { setSearchPattern } from "./searchPattern/searchPattern.actions"
import { setSortingOption } from "./sortingOption/sortingOption.actions"

export const dynamicSettingsActions = [
	setColorMode,
	setSortingOption,
	setEdgeMetric,
	setColorRange,
	setMargin,
	setSearchPattern,
	setStandard,
	setAllFocusedNodes,
	unfocusAllNodes,
	focusNode,
	unfocusNode,
	setHeightMetric,
	setDistributionMetric,
	setColorMetric,
	setAreaMetric
]
