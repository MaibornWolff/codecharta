import { setStandard } from "../../../fileStore/store/files.actions"
import { setAreaMetric } from "../../../mapState/store/areaMetric/areaMetric.actions"
import { setColorMetric } from "../../../mapState/store/colorMetric/colorMetric.actions"
import { setColorMode } from "../../../mapState/store/colorMode/colorMode.actions"
import { setColorRange } from "../../../mapState/store/colorRange/colorRange.actions"
import { setDistributionMetric } from "../../../mapState/store/distributionMetric/distributionMetric.actions"
import { setEdgeMetric } from "../../../mapState/store/edgeMetric/edgeMetric.actions"
import { setAllFocusedNodes, unfocusAllNodes, focusNode, unfocusNode } from "./focusedNodePath/focusedNodePath.actions"
import { setHeightMetric } from "../../../mapState/store/heightMetric/heightMetric.actions"
import { setMargin } from "../../../mapState/store/margin/margin.actions"
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
