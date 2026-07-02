import { distributionMetric } from "./distributionMetric.reducer"
import { setDistributionMetric } from "./distributionMetric.actions"

describe("distributionMetric", () => {
    it("should set new distributionMetric", () => {
        const result = distributionMetric("mcc", setDistributionMetric({ value: "another_distribution_metric" }))

        expect(result).toEqual("another_distribution_metric")
    })
})
