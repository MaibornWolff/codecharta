import { areMetricsAvailable } from "./areMetricsAvailable"

describe("areMetricsAvailable", () => {
	const nodeMetricData = [{ key: "mcc" }, { key: "rloc" }]

	it("should return false if some metric is not available", () => {
		expect(areMetricsAvailable(nodeMetricData, ["mcc", "loc"])).toBe(false)
	})

	it("should return true if all metric are available", () => {
		expect(areMetricsAvailable(nodeMetricData, ["mcc", "rloc"])).toBe(true)
	})
})
