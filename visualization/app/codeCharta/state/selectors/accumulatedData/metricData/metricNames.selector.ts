import { createSelector } from "@ngrx/store"
import { metricDataSelector } from "./metricData.selector"

export const metricNamesSelector = createSelector(metricDataSelector, metricData => metricData.edgeMetricData.map(x => x.name))
