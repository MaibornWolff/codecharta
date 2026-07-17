import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const colorMetricSelector = createSelector(mapStateSelector, mapState => mapState.colorMetric)
