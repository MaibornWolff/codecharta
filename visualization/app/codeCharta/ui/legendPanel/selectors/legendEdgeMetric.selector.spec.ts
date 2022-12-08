import { _getLegendEdgeMetric } from "./legendEdgeMetric.selector"

describe("_getLegendEdgeMetric", () => {
	it("should return nothing if there are no edgeMetricData", () => {
		expect(_getLegendEdgeMetric("rloc", [], undefined)).toBe(undefined)
	})

	it("should return nothing if edgeMetricData maxValue' is smaller than 0", () => {
		expect(_getLegendEdgeMetric("rloc", [{ key: "rloc", maxValue: undefined, minValue: undefined }], undefined)).toBe(undefined)
	})

	it("should get existing legendEdgeMetric", () => {
		expect(_getLegendEdgeMetric("rloc", [{ key: "rloc", maxValue: 10, minValue: 0 }], undefined)).toEqual({
			metricName: "rloc",
			title: "Real Lines of Code",
			description: undefined
		})
	})
})
