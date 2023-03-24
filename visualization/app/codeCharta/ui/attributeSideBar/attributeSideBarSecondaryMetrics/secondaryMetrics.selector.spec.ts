import { DIFFERENT_NODE } from "../../../util/dataMocks"
import { _calculateSecondaryMetrics } from "./secondaryMetrics.selector"
import { AttributeDescriptors } from "../../../codeCharta.model"

const primaryMetricNames = {
	areaMetric: "a",
	heightMetric: "a",
	colorMetric: "a",
	edgeMetric: "None"
}

const attributeDescriptors: AttributeDescriptors = {}

describe("secondaryMetricsSelector", () => {
	it("should return an empty list if there is no selectedNode", () => {
		expect(_calculateSecondaryMetrics(primaryMetricNames, attributeDescriptors)).toEqual([])
	})

	it("should return a by name sorted list of metrics without primary metrics", () => {
		expect(_calculateSecondaryMetrics(primaryMetricNames, attributeDescriptors, DIFFERENT_NODE)).toEqual([
			{
				name: "b",
				value: 15,
				descriptors: {
					description: undefined,
					hintHighValue: undefined,
					hintLowValue: undefined,
					key: "b",
					link: undefined,
					title: undefined
				}
			},
			{
				name: "mcc",
				value: 14,
				descriptors: {
					description: undefined,
					hintHighValue: undefined,
					hintLowValue: undefined,
					key: "mcc",
					link: undefined,
					title: "Cyclomatic Complexity"
				}
			}
		])
	})
})
