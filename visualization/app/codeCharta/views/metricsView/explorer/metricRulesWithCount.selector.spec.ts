import { CodeMapNode, MetricRule, NodeType } from "../../../model/codeCharta.model"
import { excludeMetricRulesWithCountSelector, flattenMetricRulesWithCountSelector } from "./metricRulesWithCount.selector"

const leaf = (path: string, attributes: Record<string, number>): CodeMapNode => ({
    name: path.split("/").pop() ?? path,
    path,
    type: NodeType.FILE,
    attributes
})

const rule = (overrides: Partial<MetricRule> = {}): MetricRule => ({
    id: "rule-1",
    metric: "mcc",
    operator: "gt",
    value: 10,
    type: "flatten",
    ...overrides
})

const leaves: CodeMapNode[] = [
    leaf("/root/a.ts", { mcc: 30 }),
    leaf("/root/b.ts", { mcc: 11 }),
    leaf("/root/c.ts", { mcc: 4 }),
    leaf("/root/d.ts", { rloc: 200 })
]

describe("metricRulesWithCount.selector", () => {
    it("should count the files a flatten rule matches", () => {
        // Arrange & Act
        const result = flattenMetricRulesWithCountSelector.projector([rule()], leaves)

        // Assert
        expect(result).toHaveLength(1)
        expect(result[0].affectedCount).toBe(2)
    })

    it("should label a rule by what it removes", () => {
        // Arrange & Act
        const result = flattenMetricRulesWithCountSelector.projector([rule()], leaves)

        // Assert
        expect(result[0].label).toBe("mcc > 10")
        expect(result[0].kind).toBe("METRIC")
    })

    it("should not count a file that has no value for the metric", () => {
        // Arrange & Act
        const result = flattenMetricRulesWithCountSelector.projector([rule({ operator: "lt", value: 100 })], leaves)

        // Assert — d.ts has no mcc at all and must stay out of the count
        expect(result[0].affectedCount).toBe(3)
    })

    it("should keep flatten and exclude rules in their own lists", () => {
        // Arrange
        const rules = [rule({ id: "f" }), rule({ id: "e", type: "exclude" })]

        // Act & Assert
        expect(flattenMetricRulesWithCountSelector.projector(rules, leaves).map(entry => entry.id)).toEqual(["f"])
        expect(excludeMetricRulesWithCountSelector.projector(rules, leaves).map(entry => entry.id)).toEqual(["e"])
    })

    it("should count each of several active rules on its own", () => {
        // Arrange
        const rules = [rule({ id: "a", operator: "gt", value: 10 }), rule({ id: "b", operator: "lt", value: 5 })]

        // Act
        const result = flattenMetricRulesWithCountSelector.projector(rules, leaves)

        // Assert
        expect(result.map(entry => entry.affectedCount)).toEqual([2, 1])
    })
})
