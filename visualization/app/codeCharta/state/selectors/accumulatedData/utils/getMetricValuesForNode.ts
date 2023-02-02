import { HierarchyNode } from "d3-hierarchy"
import { CodeMapNode } from "../../../../codeCharta.model"
import { EdgeMetricCountMap, NodeEdgeMetricsMap } from "../metricData/edgeMetricData.calculator"

export const getMetricValuesForNode = (nodeEdgeMetricsMap: NodeEdgeMetricsMap, node: HierarchyNode<CodeMapNode>, metricNames: string[]) => {
	const nodeEdgeMetrics: EdgeMetricCountMap = new Map()

	for (const metricName of metricNames) {
		const edgeMetricCount = nodeEdgeMetricsMap.get(metricName)
		if (edgeMetricCount) {
			nodeEdgeMetrics.set(metricName, edgeMetricCount.get(node.data.path))
		}
	}

	return nodeEdgeMetrics
}
