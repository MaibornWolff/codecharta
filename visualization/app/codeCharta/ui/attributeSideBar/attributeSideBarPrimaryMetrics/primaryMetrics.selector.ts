import { createSelector } from "../../../state/angular-redux/store"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"
import { CcState } from "../../../state/store/store"
import { Metric } from "../util/metric"
import { primaryMetricNamesSelector } from "./primaryMetricNames.selector"

export type PrimaryMetrics = {
	area: Metric
	height: Metric
	color: Metric
	edge: { name: string; incoming: number | undefined; outgoing: number | undefined }
}

export const primaryMetricsSelector: (state: CcState) => PrimaryMetrics | undefined = createSelector(
	[selectedNodeSelector, primaryMetricNamesSelector],
	(selectedNode, primaryMetricNames) => {
		if (!selectedNode) return

		return {
			area: {
				name: primaryMetricNames.nameOfAreaMetric,
				value: selectedNode.attributes[primaryMetricNames.nameOfAreaMetric]
			},
			height: {
				name: primaryMetricNames.nameOfHeightMetric,
				value: selectedNode.attributes[primaryMetricNames.nameOfHeightMetric]
			},
			color: {
				name: primaryMetricNames.nameOfColorMetric,
				value: selectedNode.attributes[primaryMetricNames.nameOfColorMetric]
			},
			edge: {
				name: primaryMetricNames.nameOfEdgeMetric,
				incoming: selectedNode.edgeAttributes[primaryMetricNames.nameOfEdgeMetric]?.incoming,
				outgoing: selectedNode.edgeAttributes[primaryMetricNames.nameOfEdgeMetric]?.outgoing
			}
		}
	}
)
