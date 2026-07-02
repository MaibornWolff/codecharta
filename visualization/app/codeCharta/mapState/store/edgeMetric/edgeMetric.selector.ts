import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const edgeMetricSelector = createSelector(mapStateSelector, mapState => mapState.edgeMetric)
