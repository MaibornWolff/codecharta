import { _getLegendEdgeMetric } from "./legendEdgeMetric.selector"
import { ATTRIBUTE_DESCRIPTORS_HALF_FILLED } from "../../../util/dataMocks"

describe("_getLegendEdgeMetric", () => {
	it("should return nothing if there are no edgeMetricData", () => {
		expect(_getLegendEdgeMetric("rloc", [], undefined)).toBe(undefined)
	})

	it("should return nothing if edgeMetricData maxValue' is smaller than 0", () => {
		expect(
			_getLegendEdgeMetric(
				"rloc",
				[
					{
						name: "rloc",
						maxValue: undefined,
						minValue: undefined
					}
				],
				undefined
			)
		).toBe(undefined)
	})

	it("should get existing legendEdgeMetric", () => {
		expect(_getLegendEdgeMetric("rloc", [{ name: "rloc", maxValue: 10, minValue: 0 }], undefined)).toEqual({
			metricName: "rloc",
			title: "Real Lines of Code",
			description: undefined
		})
	})

	it("should get existing legendEdgeMetric with given attribute descriptors", () => {
		expect(
			_getLegendEdgeMetric(
				"mcc",
				[
					{
						name: "mcc",
						maxValue: 10,
						minValue: 0
					}
				],
				ATTRIBUTE_DESCRIPTORS_HALF_FILLED
			)
		).toEqual({
			metricName: "mcc",
			title: "Maximum Cyclic Complexity",
			description: "Maximum cyclic complexity"
		})

		expect(
			_getLegendEdgeMetric(
				"rloc",
				[
					{
						name: "rloc",
						maxValue: 10,
						minValue: 0
					}
				],
				ATTRIBUTE_DESCRIPTORS_HALF_FILLED
			)
		).toEqual({
			metricName: "rloc",
			title: "Real Lines of Code",
			description: ""
		})
	})
})
