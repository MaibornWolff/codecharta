import { createSelector } from "../../../state/angular-redux/store"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"
import { CcState } from "../../../state/store/store"
import { primaryMetricNamesSelector } from "./primaryMetricNames.selector"

export type Metric = {
	name: string
	value: number
}

export type PrimaryMetrics = {
	area: Metric | undefined
	height: Metric | undefined
	color: Metric | undefined
	edge: { name: string; incoming: number | undefined; outgoing: number | undefined } | undefined
}

export const primaryMetricsSelector: (state: CcState) => PrimaryMetrics = createSelector(
	[selectedNodeSelector, primaryMetricNamesSelector],
	(selectedNode, primaryMetricNames) => {
		if (!selectedNode?.attributes)
			return {
				area: undefined,
				height: undefined,
				color: undefined,
				edge: undefined
			}

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
