import { createSelector } from "../../angular-redux/createSelector"
import { edgeMetricDataSelector } from "../../store/metricData/edgeMetricData/edgeMetricData.selector"

// TODO move
export const metricNamesSelector = createSelector([edgeMetricDataSelector], edgeMetricData => edgeMetricData.map(x => x.name))
