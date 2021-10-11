import { createSelector } from "../../../angular-redux/createSelector"
import { metricDataSelector } from "../metricData.selector"

export const edgeMetricDataSelector = createSelector([metricDataSelector], metricData => metricData.edgeMetricData)
