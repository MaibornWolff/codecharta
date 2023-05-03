import { selectedNodeSelector } from "../selectedNode.selector"
import { Metric } from "../../../ui/attributeSideBar/util/metric"
import { primaryMetricNamesSelector } from "./primaryMetricNames.selector"
import { getMetricDescriptors } from "../../../util/metric/metricDescriptors"
import { attributeDescriptorsSelector } from "../../store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { Edge } from "app/codeCharta/ui/attributeSideBar/util/edge"
import { CodeMapNode } from "app/codeCharta/codeCharta.model"
import { AttributeDescriptors } from "../../../codeCharta.model"
import { createSelector } from "@ngrx/store"

export type PrimaryMetrics = {
	area: Metric
	height: Metric
	color: Metric
	edge: Edge
}

export const primaryMetricsSelector = createSelector(
	selectedNodeSelector,
	primaryMetricNamesSelector,
	attributeDescriptorsSelector,
	(selectedNode, primaryMetricNames, attributeDescriptors) => {
		if (!selectedNode) {
			return
		}

		return {
			area: {
				name: primaryMetricNames.areaMetric,
				value: selectedNode.attributes[primaryMetricNames.areaMetric],
				descriptors: getMetricDescriptors(primaryMetricNames.areaMetric, attributeDescriptors)
			},
			height: {
				name: primaryMetricNames.heightMetric,
				value: selectedNode.attributes[primaryMetricNames.heightMetric],
				descriptors: getMetricDescriptors(primaryMetricNames.heightMetric, attributeDescriptors)
			},
			color: {
				name: primaryMetricNames.colorMetric,
				value: selectedNode.attributes[primaryMetricNames.colorMetric],
				descriptors: getMetricDescriptors(primaryMetricNames.colorMetric, attributeDescriptors)
			},
			edge: getEdge(primaryMetricNames.edgeMetric, selectedNode, attributeDescriptors)
		}
	}
)

function getEdge(key: string, selectedNode: CodeMapNode, attributeDescriptors: AttributeDescriptors): Edge {
	if (key === undefined || key === null) {
		return null
	}
	return {
		name: key,
		incoming: selectedNode.edgeAttributes[key]?.incoming,
		outgoing: selectedNode.edgeAttributes[key]?.outgoing,
		descriptors: getMetricDescriptors(key, attributeDescriptors)
	}
}
