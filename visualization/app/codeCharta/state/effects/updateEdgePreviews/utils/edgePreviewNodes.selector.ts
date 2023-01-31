import { createSelector } from "../../../angular-redux/createSelector"
import { NodeEdgeMetricsMap } from "../../../selectors/accumulatedData/metricData/edgeMetricData.calculator"
import { metricDataSelector } from "../../../selectors/accumulatedData/metricData/metricData.selector"
import { amountOfEdgePreviewsSelector } from "../../../store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.selector"
import { edgeMetricSelector } from "../../../store/dynamicSettings/edgeMetric/edgeMetric.selector"

export const edgePreviewNodesSelector = createSelector(
	[metricDataSelector, edgeMetricSelector, amountOfEdgePreviewsSelector],
	(metricData, edgeMetric, amountOfEdgePreviews) =>
		new Set(_getNodesWithHighestValue(metricData.nodeEdgeMetricsMap, edgeMetric, amountOfEdgePreviews))
)

export const _getNodesWithHighestValue = (edgeMetricMap: NodeEdgeMetricsMap, edgeMetric: string, amountOfEdgePreviews: number) => {
	const keys: string[] = []

	if (amountOfEdgePreviews === 0) {
		return keys
	}

	const nodeEdgeMetrics = edgeMetricMap.get(edgeMetric)

	if (nodeEdgeMetrics === undefined) {
		return keys
	}

	// note that this depends on the fact, that edgeMetricMap is created by a list which is sorted by max value
	for (const key of nodeEdgeMetrics.keys()) {
		keys.push(key)
		if (keys.length === amountOfEdgePreviews) {
			break
		}
	}
	return keys
}
