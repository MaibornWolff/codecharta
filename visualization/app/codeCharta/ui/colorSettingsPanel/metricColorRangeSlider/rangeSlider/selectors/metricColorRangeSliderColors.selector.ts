import { createSelector } from "../../../../../state/angular-redux/createSelector"
import { isDeltaStateSelector } from "../../../../../state/selectors/isDeltaState.selector"
import { mapColorsSelector } from "../../../../../state/store/appSettings/mapColors/mapColors.selector"

export const metricColorRangeSliderColorsSelector = createSelector([mapColorsSelector, isDeltaStateSelector], (mapColors, isDeltaState) =>
	isDeltaState
		? {
				leftColor: "#DDDDDD",
				middleColor: "#DDDDDD",
				rightColor: "#DDDDDD"
		  }
		: {
				leftColor: mapColors.positive,
				middleColor: mapColors.neutral,
				rightColor: mapColors.negative
		  }
)
