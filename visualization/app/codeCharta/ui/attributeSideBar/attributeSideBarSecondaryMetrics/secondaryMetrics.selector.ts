import { CodeMapNode, PrimaryMetrics, AttributeDescriptors } from "../../../codeCharta.model"
import { createSelector } from "../../../state/angular-redux/createSelector"
import { primaryMetricNamesSelector } from "../../../state/selectors/primaryMetrics/primaryMetricNames.selector"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"
import { CcState } from "../../../state/store/store"
import { Metric } from "../util/metric"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributesDescriptors.selector"
import { getMetricDescriptors } from "../util/metricDescriptors"

export const _calculateSecondaryMetrics = (
	primaryMetrics: PrimaryMetrics,
	attributeDescriptors: AttributeDescriptors,
	node?: Pick<CodeMapNode, "attributes">
) => {
	if (!node) {
		return [] as Metric[]
	}

	const primaryMetricNamesList = Object.values(primaryMetrics)
	const secondaryMetricNames = Object.keys(node.attributes)
		.filter(metricName => metricName !== "unary" && !primaryMetricNamesList.includes(metricName))
		.sort()

	return secondaryMetricNames.map(secondaryMetricName => ({
		name: secondaryMetricName,
		value: node.attributes[secondaryMetricName],
		descriptors: getMetricDescriptors(secondaryMetricName, attributeDescriptors)
	}))
}

export const secondaryMetricsSelector: (state: CcState) => Metric[] = createSelector(
	[primaryMetricNamesSelector, attributeDescriptorsSelector, selectedNodeSelector],
	_calculateSecondaryMetrics
)
