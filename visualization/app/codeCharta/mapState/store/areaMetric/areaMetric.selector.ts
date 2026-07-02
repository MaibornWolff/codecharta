import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const areaMetricSelector = createSelector(mapStateSelector, mapState => mapState.areaMetric)
