import { createSelector } from "../../../../../state/angular-redux/createSelector"
import { mapColorsSelector } from "../../../../../state/store/appSettings/mapColors/mapColors.selector"

export const metricColorRangeSliderColorsSelector = createSelector([mapColorsSelector], mapColors => ({
	leftColor: mapColors.positive,
	middleColor: mapColors.neutral,
	rightColor: mapColors.negative
}))
