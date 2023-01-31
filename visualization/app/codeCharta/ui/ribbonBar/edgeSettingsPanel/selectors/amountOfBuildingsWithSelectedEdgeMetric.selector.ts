import { createSelector } from "../../../../state/angular-redux/createSelector"
import { metricDataSelector } from "../../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { edgeMetricSelector } from "../../../../state/store/dynamicSettings/edgeMetric/edgeMetric.selector"

export const amountOfBuildingsWithSelectedEdgeMetricSelector = createSelector(
	[metricDataSelector, edgeMetricSelector],
	(metricData, edgeMetric) => metricData.nodeEdgeMetricsMap.get(edgeMetric)?.size ?? 0
)
