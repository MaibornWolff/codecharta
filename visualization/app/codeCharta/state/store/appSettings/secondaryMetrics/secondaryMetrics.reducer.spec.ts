import { secondaryMetrics } from "./secondaryMetrics.reducer"
import { SecondaryMetricsAction, setSecondaryMetrics } from "./secondaryMetrics.actions"

describe("secondaryMetrics", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = secondaryMetrics(undefined, {} as SecondaryMetricsAction)

			expect(result).toEqual([])
		})
	})

	describe("Action: SET_SECONDARY_METRICS", () => {
		it("should set new secondaryMetrics", () => {
			const result = secondaryMetrics([], setSecondaryMetrics([{ name: "functions", type: "absolute" }]))

			expect(result).toEqual([{ name: "functions", type: "absolute" }])
		})

		it("should set default secondaryMetrics", () => {
			const result = secondaryMetrics([{ name: "functions", type: "absolute" }], setSecondaryMetrics())

			expect(result).toEqual([])
		})
	})
})
