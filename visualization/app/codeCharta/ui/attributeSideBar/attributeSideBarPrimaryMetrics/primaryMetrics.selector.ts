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
		if (!selectedNode) {
			return
		}

		return {
			area: {
				name: primaryMetricNames.areaMetric,
				value: selectedNode.attributes[primaryMetricNames.areaMetric]
			},
			height: {
				name: primaryMetricNames.heightMetric,
				value: selectedNode.attributes[primaryMetricNames.heightMetric]
			},
			color: {
				name: primaryMetricNames.colorMetric,
				value: selectedNode.attributes[primaryMetricNames.colorMetric]
			},
			edge: {
				name: primaryMetricNames.edgeMetric,
				incoming: selectedNode.edgeAttributes[primaryMetricNames.edgeMetric]?.incoming,
				outgoing: selectedNode.edgeAttributes[primaryMetricNames.edgeMetric]?.outgoing
			}
		}
	}
)
