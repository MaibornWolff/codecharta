import { _getLegendEdgeMetric } from "./legendEdgeMetric.selector"

describe("_getLegendEdgeMetric", () => {
	it("should return nothing if there are no edgeMetricData", () => {
		expect(_getLegendEdgeMetric("rloc", [])).toBe(undefined)
	})

	it("should return nothing if edgeMetricData maxValue' is smaller than 0", () => {
		expect(_getLegendEdgeMetric("rloc", [{ name: "rloc", maxValue: undefined, minValue: undefined }])).toBe(undefined)
	})

	it("should get existing legendEdgeMetric", () => {
		expect(_getLegendEdgeMetric("rloc", [{ name: "rloc", maxValue: 10, minValue: 0 }])).toEqual({
			metricName: "rloc",
			description: "real lines of code"
		})
	})
})
