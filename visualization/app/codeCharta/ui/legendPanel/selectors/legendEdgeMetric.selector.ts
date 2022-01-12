import { EdgeMetricData } from "../../../codeCharta.model"
import { createSelector } from "../../../state/angular-redux/createSelector"
import { edgeMetricDataSelector } from "../../../state/selectors/accumulatedData/metricData/edgeMetricData.selector"
import { edgeMetricSelector } from "../../../state/store/dynamicSettings/edgeMetric/edgeMetric.selector"
import { CcState } from "../../../state/store/store"
import { metricDescriptions } from "../../../util/metric/metricDescriptions"
import { LegendMetric } from "./legendMetric"

export const _getLegendEdgeMetric = (edgeMetric: string, edgeMetricDatas: EdgeMetricData[]) => {
	const edgeMetricData = edgeMetricDatas.find(someEdgeMetricData => {
		return someEdgeMetricData.name === edgeMetric
	})
	const hasEdgeMetricEdge = edgeMetricData && edgeMetricData.maxValue > 0
	if (!hasEdgeMetricEdge) return

	return {
		metricName: edgeMetric,
		description: metricDescriptions.get(edgeMetric)
	}
}

export const legendEdgeMetricSelector: (state: CcState) => LegendMetric | undefined = createSelector(
	[edgeMetricSelector, edgeMetricDataSelector],
	_getLegendEdgeMetric
)
