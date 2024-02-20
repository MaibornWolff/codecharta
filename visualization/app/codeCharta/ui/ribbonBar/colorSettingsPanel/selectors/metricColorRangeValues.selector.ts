import { createSelector } from "@ngrx/store"
import { selectedColorMetricDataSelector } from "../../../../state/selectors/accumulatedData/metricData/selectedColorMetricData.selector"
import { colorRangeSelector } from "../../../../state/store/dynamicSettings/colorRange/colorRange.selector"

export const metricColorRangeValuesSelector = createSelector(
	selectedColorMetricDataSelector,
	colorRangeSelector,
	(colorMetricData, colorRange) => ({
		values: colorMetricData.values,
		min: colorMetricData.minValue,
		max: colorMetricData.maxValue,
		from: colorRange.from,
		to: colorRange.to
	})
)
