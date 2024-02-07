import { createSelector } from "@ngrx/store"
import { isDeltaStateSelector } from "../../../../../state/selectors/isDeltaState.selector"
import { mapColorsSelector } from "../../../../../state/store/appSettings/mapColors/mapColors.selector"

export const metricColorRangeHistogramColorsSelector = createSelector(mapColorsSelector, isDeltaStateSelector, mapColors => ({
	leftColor: mapColors.positive,
	middleColor: mapColors.neutral,
	rightColor: mapColors.negative
}))
