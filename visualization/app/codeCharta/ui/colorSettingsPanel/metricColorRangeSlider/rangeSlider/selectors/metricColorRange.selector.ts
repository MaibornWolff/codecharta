import { createSelector } from "../../../../../state/angular-redux/createSelector"
import { nodeMetricRangeSelector } from "../../../../../state/selectors/accumulatedData/metricData/nodeMetricRange.selector"
import { colorRangeSelector } from "../../../../../state/store/dynamicSettings/colorRange/colorRange.selector"

export const metricColorRangeSelector = createSelector([nodeMetricRangeSelector, colorRangeSelector], (nodeMetricRange, colorRange) => ({
	min: nodeMetricRange.minValue,
	max: nodeMetricRange.maxValue,
	from: colorRange.from,
	to: colorRange.to
}))
