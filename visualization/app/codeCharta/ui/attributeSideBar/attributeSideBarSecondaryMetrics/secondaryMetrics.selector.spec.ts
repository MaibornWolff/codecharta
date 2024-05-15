import { DIFFERENT_NODE } from "../../../util/dataMocks"
import { _calculateSecondaryMetrics } from "./secondaryMetrics.selector"

const primaryMetricNames = {
    areaMetric: "a",
    heightMetric: "a",
    colorMetric: "a",
    edgeMetric: "None"
}

describe("secondaryMetricsSelector", () => {
    it("should return an empty list if there is no selectedNode", () => {
        expect(_calculateSecondaryMetrics(primaryMetricNames)).toEqual([])
    })

    it("should return a by name sorted list of metrics without primary metrics", () => {
        expect(_calculateSecondaryMetrics(primaryMetricNames, DIFFERENT_NODE)).toEqual([
            {
                name: "b",
                value: 15
            },
            {
                name: "mcc",
                value: 14
            }
        ])
    })
})
