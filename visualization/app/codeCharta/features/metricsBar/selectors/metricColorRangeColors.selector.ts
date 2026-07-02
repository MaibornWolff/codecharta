import { createSelector } from "@ngrx/store"
import { mapColorsSelector } from "../../../mapState/mapState.facade"

export const metricColorRangeColorsSelector = createSelector(mapColorsSelector, mapColors => ({
    leftColor: mapColors.positive,
    middleColor: mapColors.neutral,
    rightColor: mapColors.negative
}))
