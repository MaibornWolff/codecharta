import { EdgeMetricData } from "../../../codeCharta.model"
import { edgeMetricSelector } from "../../../state/store/dynamicSettings/edgeMetric/edgeMetric.selector"
import { getMetricDescriptors } from "../../../util/metric/metricDescriptors"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { metricDataSelector } from "../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { createSelector } from "@ngrx/store"

export const _getLegendEdgeMetric = (edgeMetric: string, edgeMetricDatas: EdgeMetricData[], attributeDescriptors) => {
	const edgeMetricData = edgeMetricDatas.find(someEdgeMetricData => {
		return someEdgeMetricData.name === edgeMetric
	})
	const hasEdgeMetricEdge = edgeMetricData && edgeMetricData.maxValue > 0
	if (!hasEdgeMetricEdge) {
		return
	}

	return getMetricDescriptors(edgeMetric, attributeDescriptors)
}

export const legendEdgeMetricSelector = createSelector(
	edgeMetricSelector,
	metricDataSelector,
	attributeDescriptorsSelector,
	(edgeMetric, metricData, attributeDescriptors) => _getLegendEdgeMetric(edgeMetric, metricData.edgeMetricData, attributeDescriptors)
)
