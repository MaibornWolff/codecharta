import { MetricRule } from "../../model/codeCharta.model"
import { createMetricRuleMatcher } from "./metricRuleMatcher"

const flattenRule = (overrides: Partial<MetricRule> = {}): MetricRule => ({
    id: "rule-1",
    metric: "mcc",
    operator: "gt",
    value: 10,
    type: "flatten",
    ...overrides
})

const METRICS_ON_MAP: ReadonlySet<string> = new Set(["mcc", "rloc"])

const matcherFor = (rules: MetricRule[]) => createMetricRuleMatcher(rules, METRICS_ON_MAP)

describe("createMetricRuleMatcher", () => {
    it("should match nothing when there are no rules", () => {
        // Arrange
        const matcher = matcherFor([])

        // Act
        const classification = matcher.classify({ mcc: 500 })

        // Assert
        expect(classification).toEqual({ isFlattened: false, isExcluded: false })
    })

    it("should read a missing value of a metric on the map as 0", () => {
        // Arrange
        const matcher = matcherFor([flattenRule({ operator: "lt", value: 1 })])

        // Act
        const classification = matcher.classify({ rloc: 3 })

        // Assert
        expect(classification.isFlattened).toBe(true)
    })

    it("should not match a missing value when 0 is outside the condition", () => {
        // Arrange
        const matcher = matcherFor([flattenRule({ operator: "gt", value: 0 })])

        // Act
        const classification = matcher.classify({ rloc: 3 })

        // Assert
        expect(classification.isFlattened).toBe(false)
    })

    it("should read a file without any attributes as 0 for every metric on the map", () => {
        // Arrange
        const matcher = matcherFor([flattenRule({ operator: "lt", value: 1 })])

        // Act
        const classification = matcher.classify(undefined)

        // Assert
        expect(classification.isFlattened).toBe(true)
    })

    it("should match no file for a metric the map does not have", () => {
        // Arrange
        const matcher = matcherFor([flattenRule({ metric: "coverage", operator: "lt", value: 1 })])

        // Act
        const classification = matcher.classify({ mcc: 0 })

        // Assert
        expect(classification.isFlattened).toBe(false)
    })

    it("should flatten a file above the threshold when the operator is greater than", () => {
        // Arrange
        const matcher = matcherFor([flattenRule()])

        // Act & Assert
        expect(matcher.classify({ mcc: 11 }).isFlattened).toBe(true)
        expect(matcher.classify({ mcc: 10 }).isFlattened).toBe(false)
    })

    it("should include the threshold itself when the operator is at least", () => {
        // Arrange
        const matcher = matcherFor([flattenRule({ operator: "gte" })])

        // Act & Assert
        expect(matcher.classify({ mcc: 10 }).isFlattened).toBe(true)
        expect(matcher.classify({ mcc: 9 }).isFlattened).toBe(false)
    })

    it("should flatten a file below the threshold when the operator is less than", () => {
        // Arrange
        const matcher = matcherFor([flattenRule({ operator: "lt" })])

        // Act & Assert
        expect(matcher.classify({ mcc: 9 }).isFlattened).toBe(true)
        expect(matcher.classify({ mcc: 10 }).isFlattened).toBe(false)
    })

    it("should include the threshold itself when the operator is at most", () => {
        // Arrange
        const matcher = matcherFor([flattenRule({ operator: "lte" })])

        // Act & Assert
        expect(matcher.classify({ mcc: 10 }).isFlattened).toBe(true)
        expect(matcher.classify({ mcc: 11 }).isFlattened).toBe(false)
    })

    it("should match only the exact value when the operator is equals", () => {
        // Arrange
        const matcher = matcherFor([flattenRule({ operator: "eq" })])

        // Act & Assert
        expect(matcher.classify({ mcc: 10 }).isFlattened).toBe(true)
        expect(matcher.classify({ mcc: 11 }).isFlattened).toBe(false)
    })

    it("should include both ends of the range when the operator is between", () => {
        // Arrange
        const matcher = matcherFor([flattenRule({ operator: "between", value: 5, upperValue: 20 })])

        // Act & Assert
        expect(matcher.classify({ mcc: 5 }).isFlattened).toBe(true)
        expect(matcher.classify({ mcc: 20 }).isFlattened).toBe(true)
        expect(matcher.classify({ mcc: 4 }).isFlattened).toBe(false)
        expect(matcher.classify({ mcc: 21 }).isFlattened).toBe(false)
    })

    it("should match a between range whose bounds were entered the wrong way round", () => {
        // Arrange
        const matcher = matcherFor([flattenRule({ operator: "between", value: 20, upperValue: 5 })])

        // Act & Assert
        expect(matcher.classify({ mcc: 7 }).isFlattened).toBe(true)
    })

    it("should match nothing for a between rule that is missing its upper bound", () => {
        // Arrange
        const matcher = matcherFor([flattenRule({ operator: "between", value: 5 })])

        // Act & Assert
        expect(matcher.classify({ mcc: 5 }).isFlattened).toBe(false)
    })

    it("should report an exclude rule as excluded rather than flattened", () => {
        // Arrange
        const matcher = matcherFor([flattenRule({ type: "exclude" })])

        // Act
        const classification = matcher.classify({ mcc: 11 })

        // Assert
        expect(classification).toEqual({ isFlattened: false, isExcluded: true })
    })

    it("should apply every rule, so a file matched by any of them is affected", () => {
        // Arrange
        const matcher = matcherFor([
            flattenRule({ id: "a", metric: "mcc", operator: "gt", value: 100 }),
            flattenRule({ id: "b", metric: "rloc", operator: "lt", value: 5, type: "exclude" })
        ])

        // Act
        const classification = matcher.classify({ mcc: 3, rloc: 2 })

        // Assert
        expect(classification).toEqual({ isFlattened: false, isExcluded: true })
    })

    it("should ignore a non-numeric value so a broken attribute cannot hide a file", () => {
        // Arrange
        const matcher = matcherFor([flattenRule({ operator: "lt", value: 10 })])

        // Act
        const classification = matcher.classify({ mcc: Number.NaN })

        // Assert
        expect(classification.isFlattened).toBe(false)
    })
})
