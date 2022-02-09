import { CodeMapNode } from "../../../codeCharta.model"
import { createSelector } from "../../../state/angular-redux/store"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"
import { CcState } from "../../../state/store/store"
import { PrimaryMetricNames, primaryMetricNamesSelector } from "../attributeSideBarPrimaryMetrics/primaryMetricNames.selector"
import { Metric } from "../util/metric"

export const _calculateSecondaryMetrics = (primaryMetricNames: PrimaryMetricNames, node?: CodeMapNode) => {
	if (!node) return [] as Metric[]

	const primaryMetricNamesList = Object.values(primaryMetricNames)
	const secondaryMetricNames = Object.keys(node.attributes)
		.filter(metricName => metricName !== "unary" && !primaryMetricNamesList.includes(metricName))
		.sort()

	return secondaryMetricNames.map(secondaryMetricName => ({
		name: secondaryMetricName,
		value: node.attributes[secondaryMetricName]
	}))
}

export const secondaryMetricsSelector: (state: CcState) => Metric[] = createSelector(
	[primaryMetricNamesSelector, selectedNodeSelector],
	_calculateSecondaryMetrics
)
