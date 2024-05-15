import { createSelector } from "@ngrx/store"
import { mapColorsSelector } from "../../../../state/store/appSettings/mapColors/mapColors.selector"
import { isDeltaStateSelector } from "../../../../state/selectors/isDeltaState.selector"

export const metricColorRangeColorsSelector = createSelector(mapColorsSelector, isDeltaStateSelector, mapColors => ({
    leftColor: mapColors.positive,
    middleColor: mapColors.neutral,
    rightColor: mapColors.negative
}))
