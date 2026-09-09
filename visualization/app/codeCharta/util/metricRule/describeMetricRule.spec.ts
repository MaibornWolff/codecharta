import { MetricRule } from "../../model/codeCharta.model"
import { describeMetricRule } from "./describeMetricRule"

const rule = (overrides: Partial<MetricRule> = {}): MetricRule => ({
    id: "rule-1",
    metric: "mcc",
    operator: "gt",
    value: 10,
    type: "flatten",
    ...overrides
})

describe("describeMetricRule", () => {
    it("should describe a greater-than rule", () => {
        // Arrange & Act & Assert
        expect(describeMetricRule(rule())).toBe("mcc > 10")
    })

    it("should describe the inclusive comparisons", () => {
        // Arrange & Act & Assert
        expect(describeMetricRule(rule({ operator: "gte" }))).toBe("mcc ≥ 10")
        expect(describeMetricRule(rule({ operator: "lte" }))).toBe("mcc ≤ 10")
    })

    it("should describe a less-than rule", () => {
        // Arrange & Act & Assert
        expect(describeMetricRule(rule({ operator: "lt" }))).toBe("mcc < 10")
    })

    it("should describe an equals rule", () => {
        // Arrange & Act & Assert
        expect(describeMetricRule(rule({ operator: "eq" }))).toBe("mcc = 10")
    })

    it("should describe a between rule with both bounds", () => {
        // Arrange & Act & Assert
        expect(describeMetricRule(rule({ operator: "between", value: 5, upperValue: 20 }))).toBe("mcc 5…20")
    })

    it("should describe a between rule that has no upper bound yet as a single value", () => {
        // Arrange & Act & Assert
        expect(describeMetricRule(rule({ operator: "between", value: 5 }))).toBe("mcc 5…5")
    })

    it("should order the bounds of a between rule that was entered the wrong way round", () => {
        // Arrange & Act & Assert
        expect(describeMetricRule(rule({ operator: "between", value: 20, upperValue: 5 }))).toBe("mcc 5…20")
    })
})
