import { createSelector } from "../../../../../state/angular-redux/createSelector"
import { colorRangeSelector } from "../../../../../state/store/dynamicSettings/colorRange/colorRange.selector"

export const metricColorRangeSelector = createSelector([colorRangeSelector], colorRange => ({
	min: Math.round(colorRange.min),
	max: Math.round(colorRange.max),
	from: Math.round(colorRange.from),
	to: Math.round(colorRange.to)
}))
