import { createSelector } from "../angular-redux/createSelector"
import { NodeMetricDataService } from "../store/metricData/nodeMetricData/nodeMetricData.service"
import { decoratedUnifiedMapSelector } from "./decoratedUnifiedMap.selector"
// import { unifiedMapSelector } from "./unifiedMap.selector"

export const totalUnarySelector = createSelector(
	[decoratedUnifiedMapSelector],
	unifiedFile => unifiedFile?.map.attributes[NodeMetricDataService.UNARY_METRIC]
)
