import { createSelector } from "../../../state/angular-redux/store"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"
import { CcState } from "../../../state/store/store"
import { primaryMetricNamesSelector } from "../attributeSideBarPrimaryMetrics/primaryMetricNames.selector"
import { Metric } from "../attributeSideBarPrimaryMetrics/primaryMetrics.selector"

export type SecondaryMetric = Metric & {
	showAttributeTypeSelector: boolean
	showDeltaValue: boolean
}

export const secondaryMetricsSelector: (state: CcState) => SecondaryMetric[] = createSelector(
	[selectedNodeSelector, primaryMetricNamesSelector],
	(selectedNode, primaryMetricNames) => {
		if (!selectedNode) return []

		const primaryMetricNamesList = Object.values(primaryMetricNames)
		const secondaryMetricNames = Object.keys(selectedNode.attributes)
			.filter(metricName => metricName !== "unary" && !primaryMetricNamesList.includes(metricName))
			.sort()

		return secondaryMetricNames.map(secondaryMetricName => ({
			name: secondaryMetricName,
			value: selectedNode.attributes[secondaryMetricName],
			showAttributeTypeSelector: !selectedNode.isLeaf,
			showDeltaValue: Boolean(selectedNode.deltas)
		}))
	}
)
