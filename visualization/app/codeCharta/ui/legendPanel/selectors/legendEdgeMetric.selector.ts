import { EdgeMetricData } from "../../../codeCharta.model"
import { createSelector } from "../../../state/angular-redux/createSelector"
import { edgeMetricSelector } from "../../../state/store/dynamicSettings/edgeMetric/edgeMetric.selector"
import { CcState } from "../../../state/store/store"
import { getMetricDescriptors, MetricDescriptors } from "../../../util/metric/metricDescriptors"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { metricDataSelector } from "../../../state/selectors/accumulatedData/metricData/metricData.selector"

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

export const legendEdgeMetricSelector: (state: CcState) => MetricDescriptors | undefined = createSelector(
	[edgeMetricSelector, metricDataSelector, attributeDescriptorsSelector],
	(edgeMetric, metricData, attributeDescriptors) => _getLegendEdgeMetric(edgeMetric, metricData.edgeMetricData, attributeDescriptors)
)
