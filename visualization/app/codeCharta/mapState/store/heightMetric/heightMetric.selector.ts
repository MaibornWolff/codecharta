import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const heightMetricSelector = createSelector(mapStateSelector, mapState => mapState.heightMetric)
