import { getMetricNameFromIndexOrLast, isAnyMetricAvailable, isMetricUnavailable } from "./metricHelper"

describe("metricHelper", () => {
	describe("isAnyMetricAvailable", () => {
		it("should return true when there is a metric with a maxValue", () => {
			expect(isAnyMetricAvailable([{ maxValue: 1 }])).toBe(true)
		})

		it("should return false when there is no metric available", () => {
			expect(isAnyMetricAvailable([])).toBe(false)
		})
	})

	describe("isMetricUnavailable", () => {
		it("should return true, when given metric is not available", () => {
			expect(isMetricUnavailable([{ name: "a", maxValue: 1 }], "b")).toBe(true)
		})

		it("should return false, when given metric is available", () => {
			expect(isMetricUnavailable([{ name: "a", maxValue: 1 }], "a")).toBe(false)
		})
	})

	describe("getMetricNameFromIndexOrLast", () => {
		it("should return metric at given index if it exists", () => {
			expect(
				getMetricNameFromIndexOrLast(
					[
						{ name: "a", maxValue: 1 },
						{ name: "b", maxValue: 2 }
					],
					0
				)
			).toBe("a")
		})

		it("should return metric at last index if given index is to large", () => {
			expect(getMetricNameFromIndexOrLast([{ name: "a", maxValue: 1 }], 1)).toBe("a")
		})
	})
})
