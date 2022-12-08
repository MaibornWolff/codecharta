import { createSelector } from "../../../angular-redux/createSelector"
import { edgeMetricDataSelector } from "./edgeMetricData.selector"

export const metricKeysSelector = createSelector([edgeMetricDataSelector], edgeMetricData => edgeMetricData.map(x => x.key))
