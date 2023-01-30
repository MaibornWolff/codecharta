import { createSelector } from "../../../angular-redux/createSelector"
import { metricDataSelector } from "./metricData.selector"

export const metricNamesSelector = createSelector([metricDataSelector], metricData => metricData.edgeMetricData.map(x => x.name))
