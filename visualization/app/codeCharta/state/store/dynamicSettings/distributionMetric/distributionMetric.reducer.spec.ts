import { distributionMetric } from "./distributionMetric.reducer"
import { DistributionMetricAction, setDistributionMetric } from "./distributionMetric.actions"

describe("distributionMetric", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = distributionMetric(undefined, {} as DistributionMetricAction)

			expect(result).toBeNull()
		})
	})

	describe("Action: SET_DISTRIBUTION_METRIC", () => {
		it("should set new distributionMetric", () => {
			const result = distributionMetric("mcc", setDistributionMetric("another_distribution_metric"))

			expect(result).toEqual("another_distribution_metric")
		})
	})
})
