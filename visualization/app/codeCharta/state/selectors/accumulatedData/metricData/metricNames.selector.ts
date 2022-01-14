import { createSelector } from "../../../angular-redux/createSelector"
import { edgeMetricDataSelector } from "./edgeMetricData.selector"

export const metricNamesSelector = createSelector([edgeMetricDataSelector], edgeMetricData => edgeMetricData.map(x => x.name))
