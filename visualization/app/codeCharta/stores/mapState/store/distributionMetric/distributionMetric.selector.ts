import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const distributionMetricSelector = createSelector(mapStateSelector, mapState => mapState.distributionMetric)
