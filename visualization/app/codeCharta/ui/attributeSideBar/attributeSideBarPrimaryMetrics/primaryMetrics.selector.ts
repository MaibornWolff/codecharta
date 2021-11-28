import { createSelector } from "../../../state/angular-redux/store"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"
import { CcState } from "../../../state/store/store"
import { primaryMetricNamesSelector } from "./primaryMetricNames.selector"

export type Metric = {
	name: string
	value: number
	showAttributeTypeSelector: boolean
}

export type PrimaryMetrics = {
	area: Metric
	height: Metric
	color: Metric
	edge: { name: string; incoming: number; outgoing: number } | undefined
}

export const primaryMetricsSelector: (state: CcState) => PrimaryMetrics | undefined = createSelector(
	[selectedNodeSelector, primaryMetricNamesSelector],
	(selectedNode, primaryMetricNames) => {
		if (!selectedNode?.attributes) return

		const showAttributeTypeSelector = !selectedNode.isLeaf
		return {
			area: {
				name: primaryMetricNames.nameOfAreaMetric,
				value: selectedNode.attributes[primaryMetricNames.nameOfAreaMetric],
				showAttributeTypeSelector
			},
			height: {
				name: primaryMetricNames.nameOfHeightMetric,
				value: selectedNode.attributes[primaryMetricNames.nameOfHeightMetric],
				showAttributeTypeSelector
			},
			color: {
				name: primaryMetricNames.nameOfColorMetric,
				value: selectedNode.attributes[primaryMetricNames.nameOfColorMetric],
				showAttributeTypeSelector
			},
			edge: {
				name: primaryMetricNames.nameOfEdgeMetric,
				incoming: selectedNode.edgeAttributes[primaryMetricNames.nameOfEdgeMetric]?.incoming,
				outgoing: selectedNode.edgeAttributes[primaryMetricNames.nameOfEdgeMetric]?.outgoing,
				showAttributeTypeSelector
			}
		}
	}
)
