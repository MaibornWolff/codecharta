import { HierarchyNode } from "d3-hierarchy"
import { CodeMapNode } from "../../../../codeCharta.model"
import { NodeEdgeMetricsMap, EdgeMetricCountMap } from "../metricData/edgeMetricData.calculator"
import { getMetricValuesForNode } from "./getMetricValuesForNode"

describe("getMetricValuesForNode", () => {
    it("should return Edge Metric counts for node", () => {
        const metricNames = ["pairingRate"]
        const node = { data: { path: "/root/big leaf" } } as HierarchyNode<CodeMapNode>
        const nodesEdgeMetricCountMap: EdgeMetricCountMap = new Map([["/root/big leaf", { incoming: 0, outgoing: 1 }]])
        const nodeEdgeMetricsMap: NodeEdgeMetricsMap = new Map([["pairingRate", nodesEdgeMetricCountMap]])

        const metricsForNode = getMetricValuesForNode(nodeEdgeMetricsMap, node, metricNames)

        expect(metricsForNode.get(metricNames[0])).toEqual({ incoming: 0, outgoing: 1 })
    })
})
