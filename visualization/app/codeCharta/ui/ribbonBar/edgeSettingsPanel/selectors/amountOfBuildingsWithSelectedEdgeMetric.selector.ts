import { createSelector } from "../../../../state/angular-redux/createSelector"
import { edgeMetricMapSelector } from "../../../../state/selectors/accumulatedData/metricData/edgeMetricData.selector"
import { edgeMetricSelector } from "../../../../state/store/dynamicSettings/edgeMetric/edgeMetric.selector"

export const amountOfBuildingsWithSelectedEdgeMetricSelector = createSelector(
	[edgeMetricMapSelector, edgeMetricSelector],
	(edgeMetricData, edgeMetric) => edgeMetricData.get(edgeMetric)?.size ?? 0
)
