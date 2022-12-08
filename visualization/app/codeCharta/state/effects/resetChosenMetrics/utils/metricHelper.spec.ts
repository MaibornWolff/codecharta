import { areScenarioSettingsApplicable, defaultNMetrics, isAnyMetricAvailable, preselectCombination } from "./metricHelper"

describe("metricHelper", () => {
	describe("isAnyMetricAvailable", () => {
		it("should return true when there is a metric with a maxValue", () => {
			expect(isAnyMetricAvailable([{ maxValue: 1 }])).toBe(true)
		})

		it("should return false when there is no metric available", () => {
			expect(isAnyMetricAvailable([])).toBe(false)
		})
	})

	describe("defaultNMetrics", () => {
		it("should default first n metrics with value", () => {
			const metricData = [
				{ key: "a", maxValue: 0 },
				{ key: "b", maxValue: 2 }
			]
			expect(defaultNMetrics(metricData, 1)).toEqual(["b"])
		})

		it("should fill up default metrics with last metric which had a value", () => {
			const metricData = [
				{ key: "a", maxValue: 0 },
				{ key: "b", maxValue: 2 },
				{ key: "c", maxValue: 0 }
			]
			expect(defaultNMetrics(metricData, 2)).toEqual(["b", "b"])
		})

		it("should throw in case there are no metrics available", () => {
			const metricData = [{ key: "a", maxValue: 0 }]
			expect(() => defaultNMetrics(metricData, 2)).toThrow()
		})
	})

	describe("areScenarioSettingsApplicable", () => {
		it("should return true when area-, height- and colorMetric is available", () => {
			const scenario = { dynamicSettings: { areaMetric: "a", heightMetric: "a", colorMetric: "a" } }
			const metricData = [{ key: "a", maxValue: 3 }]
			expect(areScenarioSettingsApplicable(scenario, metricData)).toBe(true)
		})

		it("should return false when there is no colorMetric", () => {
			const scenario = { dynamicSettings: { areaMetric: "a", heightMetric: "a", colorMetric: "b" } }
			const metricData = [{ key: "a", maxValue: 3 }]
			expect(areScenarioSettingsApplicable(scenario, metricData)).toBe(false)
		})
	})

	describe("matchingScenarioSetting", () => {
		it("should select the first matching metric of each category", () => {
			const metricData = [
				{ key: "rloc", maxValue: 0 },
				{ key: "mcc", maxValue: 0 }
			]

			expect(preselectCombination(metricData)).toEqual(["rloc", "mcc", "mcc"])
		})
		it("should select the next matching metric if the fist one does not match", () => {
			const metricData = [
				{ key: "loc", maxValue: 0 },
				{ key: "mcc", maxValue: 0 }
			]

			expect(preselectCombination(metricData)).toEqual(["loc", "mcc", "mcc"])
		})
	})
})
