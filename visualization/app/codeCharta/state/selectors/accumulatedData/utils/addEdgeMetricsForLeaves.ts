import { hierarchy } from "d3-hierarchy"
import { CodeMapNode, NodeEdgeMetricsMap } from "../../../../codeCharta.model"
import { isLeaf } from "../../../../util/codeMapHelper"
import { getMetricValuesForNode } from "./getMetricValuesForNode"

export const addEdgeMetricsForLeaves = (nodeEdgeMetricsMap: NodeEdgeMetricsMap, map: CodeMapNode, metricNames: string[]) => {
    if (metricNames.length === 0) {
        return
    }

    for (const node of hierarchy(map)) {
        if (isLeaf(node)) {
            const edgeMetrics = getMetricValuesForNode(nodeEdgeMetricsMap, node, metricNames)
            for (const [key, value] of edgeMetrics) {
                node.data.edgeAttributes[key] = value
            }
        }
    }
}
