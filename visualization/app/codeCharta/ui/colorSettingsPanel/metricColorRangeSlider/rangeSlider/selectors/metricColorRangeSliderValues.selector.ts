import { createSelector } from "../../../../../state/angular-redux/createSelector"
import { selectedColorMetricDataSelector } from "../../../../../state/selectors/accumulatedData/metricData/selectedColorMetricData.selector"
import { colorRangeSelector } from "../../../../../state/store/dynamicSettings/colorRange/colorRange.selector"

export const metricColorRangeSliderValuesSelector = createSelector(
	[selectedColorMetricDataSelector, colorRangeSelector],
	(nodeMetricRange, colorRange) => ({
		min: nodeMetricRange.minValue,
		max: nodeMetricRange.maxValue,
		from: colorRange.from,
		to: colorRange.to
	})
)
