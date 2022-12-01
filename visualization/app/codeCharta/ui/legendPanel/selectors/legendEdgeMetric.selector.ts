import { EdgeMetricData } from "../../../codeCharta.model"
import { createSelector } from "../../../state/angular-redux/createSelector"
import { edgeMetricDataSelector } from "../../../state/selectors/accumulatedData/metricData/edgeMetricData.selector"
import { edgeMetricSelector } from "../../../state/store/dynamicSettings/edgeMetric/edgeMetric.selector"
import { CcState } from "../../../state/store/store"
import { getLegendMetric, LegendMetric } from "./legendMetric"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributesDescriptors.selector"

export const _getLegendEdgeMetric = (edgeMetric: string, edgeMetricDatas: EdgeMetricData[], attributeDescriptors) => {
	const edgeMetricData = edgeMetricDatas.find(someEdgeMetricData => {
		return someEdgeMetricData.name === edgeMetric
	})
	const hasEdgeMetricEdge = edgeMetricData && edgeMetricData.maxValue > 0
	if (!hasEdgeMetricEdge) {
		return
	}

	return getLegendMetric(edgeMetric, attributeDescriptors)
}

export const legendEdgeMetricSelector: (state: CcState) => LegendMetric | undefined = createSelector(
	[edgeMetricSelector, edgeMetricDataSelector, attributeDescriptorsSelector],
	_getLegendEdgeMetric
)
