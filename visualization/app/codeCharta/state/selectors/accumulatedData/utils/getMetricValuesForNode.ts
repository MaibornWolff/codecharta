import { HierarchyNode } from "d3-hierarchy"
import { CodeMapNode } from "../../../../codeCharta.model"
import { EdgeMetricCountMap, nodeEdgeMetricsMap } from "../../../store/metricData/edgeMetricData/edgeMetricData.reducer"

export const getMetricValuesForNode = (node: HierarchyNode<CodeMapNode>, metricNames: string[]) => {
	const nodeEdgeMetrics: EdgeMetricCountMap = new Map()

	for (const metricName of metricNames) {
		const edgeMetricCount = nodeEdgeMetricsMap.get(metricName)
		if (edgeMetricCount) {
			nodeEdgeMetrics.set(metricName, edgeMetricCount.get(node.data.path))
		}
	}

	return nodeEdgeMetrics
}
