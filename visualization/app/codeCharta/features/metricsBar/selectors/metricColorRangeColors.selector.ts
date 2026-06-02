import { createSelector } from "@ngrx/store"
import { mapColorsSelector } from "../../../state/store/appSettings/mapColors/mapColors.selector"

export const metricColorRangeColorsSelector = createSelector(mapColorsSelector, mapColors => ({
    leftColor: mapColors.positive,
    middleColor: mapColors.neutral,
    rightColor: mapColors.negative
}))
