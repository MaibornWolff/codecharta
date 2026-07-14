import { getDefaultDistribution } from "./getDefaultDistributionMetric"

describe("getDefaultDistribution", () => {
    it("should default to 'rloc' if 'rloc' is present", () => {
        expect(getDefaultDistribution([{ name: "rloc" }, { name: "unary" }])).toBe("rloc")
    })

    it("should default to 'unary' if 'rloc' is not present", () => {
        expect(getDefaultDistribution([{ name: "unary" }])).toBe("unary")
    })
})
