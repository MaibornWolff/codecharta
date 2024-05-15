import { EdgeMetricCount } from "../../../../codeCharta.model"
import { _getNodesWithHighestValue } from "./edgePreviewNodes.selector"

describe("edgePreviewNodesSelector", () => {
    it("should return an empty list if there are no data for given metric", () => {
        expect(_getNodesWithHighestValue(new Map(), "rloc", 10)).toEqual([])
    })

    it("should return a first x keys for given metric", () => {
        const nodeEdgeMetricsOfRloc = new Map<string, EdgeMetricCount>([
            ["0", { incoming: 10, outgoing: 5 }],
            ["1", { incoming: 1, outgoing: 2 }]
        ])
        expect(_getNodesWithHighestValue(new Map([["rloc", nodeEdgeMetricsOfRloc]]), "rloc", 1)).toEqual(["0"])
    })

    it("should return empty list if amountOfEdgePreviews is set to 0", () => {
        const nodeEdgeMetricsOfRloc = new Map<string, EdgeMetricCount>([["0", { incoming: 10, outgoing: 5 }]])
        expect(_getNodesWithHighestValue(new Map([["rloc", nodeEdgeMetricsOfRloc]]), "rloc", 0)).toEqual([])
    })
})
