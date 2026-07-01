import { HierarchyNode } from "d3-hierarchy"
import { CodeMapNode, EdgeMetricCountMap, NodeEdgeMetricsMap } from "../../../../codeCharta.model"

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
