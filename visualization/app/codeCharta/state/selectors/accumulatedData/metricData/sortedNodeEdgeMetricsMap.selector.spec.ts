import { STATE } from "../../../../util/dataMocks"
import { calculateEdgeMetricData } from "./edgeMetricData.calculator"
import { clone } from "../../../../util/clone"
import { sortedNodeEdgeMetricsMapSelector } from "./sortedNodeEdgeMetricsMap.selector"

jest.mock("./edgeMetricData.calculator", () => ({
    calculateEdgeMetricData: jest.fn()
}))

describe("sortedNodeEdgeMetricsMapSelector", () => {
    const mockedCalculateEdgeMetricData = calculateEdgeMetricData as jest.Mock
    let state

    beforeEach(() => {
        state = clone(STATE)
    })

    it("should return a sorted map of node edge metrics", () => {
        const nodeEdgeMetricsMap = new Map([
            [
                "metric1",
                new Map([
                    ["node1", { incoming: 2, outgoing: 3 }],
                    ["node2", { incoming: 1, outgoing: 1 }],
                    ["node3", { incoming: 4, outgoing: 4 }]
                ])
            ],
            [
                "metric2",
                new Map([
                    ["node3", { incoming: 5, outgoing: 5 }],
                    ["node0", { incoming: 0, outgoing: 0 }],
                    ["node4", { incoming: 2, outgoing: 2 }]
                ])
            ]
        ])
        mockedCalculateEdgeMetricData.mockReturnValue({ nodeEdgeMetricsMap })

        const result = sortedNodeEdgeMetricsMapSelector(state)

        expect(result.get("metric1")).toEqual(
            new Map([
                ["node1", { incoming: 2, outgoing: 3 }],
                ["node3", { incoming: 4, outgoing: 4 }],
                ["node2", { incoming: 1, outgoing: 1 }]
            ])
        )
        expect(result.get("metric2")).toEqual(
            new Map([
                ["node3", { incoming: 5, outgoing: 5 }],
                ["node4", { incoming: 2, outgoing: 2 }],
                ["node0", { incoming: 0, outgoing: 0 }]
            ])
        )
    })

    it("should return an empty map if no metrics are available", () => {
        mockedCalculateEdgeMetricData.mockReturnValue({ nodeEdgeMetricsMap: new Map() })

        const result = sortedNodeEdgeMetricsMapSelector(state)

        expect(result.size).toBe(0)
    })
})
