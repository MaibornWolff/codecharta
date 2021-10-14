import { HierarchyNode } from "d3-hierarchy"
import { CodeMapNode } from "../../../../codeCharta.model"
import { getMetricValuesForNode } from "./getMetricValuesForNode"

jest.mock("../../../store/metricData/edgeMetricData/edgeMetricData.reducer", () => ({
	nodeEdgeMetricsMap: {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		get: (_metricName: string) => ({
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			get: (_path: string) => ({ incoming: 0, outgoing: 1 })
		})
	}
}))

describe("getMetricValuesForNode", () => {
	it("should return Edge Metric counts for node", () => {
		const metricNames = ["pairingRate"]
		const node = { data: { path: "/root/big leaf" } } as HierarchyNode<CodeMapNode>

		const metricsForNode = getMetricValuesForNode(node, metricNames)

		expect(metricsForNode.get(metricNames[0])).toEqual({ incoming: 0, outgoing: 1 })
	})
})
