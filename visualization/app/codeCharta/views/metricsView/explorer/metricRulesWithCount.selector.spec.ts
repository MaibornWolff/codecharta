import { MetricValues } from "../../../features/sidebarExplorer/facade"
import { MetricRule } from "../../../model/codeCharta.model"
import { excludeMetricRulesWithCountSelector, flattenMetricRulesWithCountSelector } from "./metricRulesWithCount.selector"

const rule = (overrides: Partial<MetricRule> = {}): MetricRule => ({
    id: "rule-1",
    metric: "mcc",
    operator: "gt",
    value: 10,
    type: "flatten",
    ...overrides
})

const metricValues: MetricValues = new Map([
    ["mcc", [30, 11, 4]],
    ["rloc", [200]]
])

describe("metricRulesWithCount.selector", () => {
    it("should count the files a flatten rule matches", () => {
        // Arrange & Act
        const result = flattenMetricRulesWithCountSelector.projector([rule()], metricValues)

        // Assert
        expect(result).toHaveLength(1)
        expect(result[0].affectedCount).toBe(2)
    })

    it("should label a rule by what it removes", () => {
        // Arrange & Act
        const result = flattenMetricRulesWithCountSelector.projector([rule()], metricValues)

        // Assert
        expect(result[0].label).toBe("mcc > 10")
        expect(result[0].kind).toBe("METRIC")
    })

    it("should count nothing for a metric no file has", () => {
        // Arrange & Act
        const result = flattenMetricRulesWithCountSelector.projector(
            [rule({ metric: "coverage", operator: "lt", value: 100 })],
            metricValues
        )

        // Assert
        expect(result[0].affectedCount).toBe(0)
    })

    it("should keep flatten and exclude rules in their own lists", () => {
        // Arrange
        const rules = [rule({ id: "f" }), rule({ id: "e", type: "exclude" })]

        // Act & Assert
        expect(flattenMetricRulesWithCountSelector.projector(rules, metricValues).map(entry => entry.id)).toEqual(["f"])
        expect(excludeMetricRulesWithCountSelector.projector(rules, metricValues).map(entry => entry.id)).toEqual(["e"])
    })

    it("should count each of several active rules on its own", () => {
        // Arrange
        const rules = [rule({ id: "a", operator: "gt", value: 10 }), rule({ id: "b", operator: "lt", value: 5 })]

        // Act
        const result = flattenMetricRulesWithCountSelector.projector(rules, metricValues)

        // Assert
        expect(result.map(entry => entry.affectedCount)).toEqual([2, 1])
    })
})
