import { ExcludedNode, FlattenedNode, MetricRule } from "../../../../model/codeCharta.model"
import { excludedNodes } from "../excludedNodes/excludedNodes.reducer"
import { flattenedNodes } from "../flattenedNodes/flattenedNodes.reducer"
import { metricRules } from "../metricRules/metricRules.reducer"
import { clearRulesOfType } from "./rules.actions"

const flattenedNode: FlattenedNode = { path: "**/*.spec.ts" }
const excludedNode: ExcludedNode = { path: "node_modules" }
const flattenRule: MetricRule = { id: "a", metric: "mcc", operator: "gt", value: 10, type: "flatten" }
const excludeRule: MetricRule = { id: "b", metric: "rloc", operator: "lt", value: 5, type: "exclude" }

describe("clearRulesOfType", () => {
    it("should empty the flattened nodes and leave the excluded ones alone", () => {
        // Arrange & Act
        const flattened = flattenedNodes([flattenedNode], clearRulesOfType({ ruleEffect: "flatten" }))
        const excluded = excludedNodes([excludedNode], clearRulesOfType({ ruleEffect: "flatten" }))

        // Assert
        expect(flattened).toEqual([])
        expect(excluded).toEqual([excludedNode])
    })

    it("should empty the metric rules of that type only", () => {
        // Arrange & Act
        const state = metricRules([flattenRule, excludeRule], clearRulesOfType({ ruleEffect: "flatten" }))

        // Assert
        expect(state).toEqual([excludeRule])
    })

    it("should clear both kinds of rule in one step, because one list holds both", () => {
        // Arrange & Act
        const remainingItems = flattenedNodes([flattenedNode], clearRulesOfType({ ruleEffect: "flatten" }))
        const remainingRules = metricRules([flattenRule], clearRulesOfType({ ruleEffect: "flatten" }))

        // Assert
        expect(remainingItems).toEqual([])
        expect(remainingRules).toEqual([])
    })

    it("should leave the hidden list alone when the flattened one is cleared", () => {
        // Arrange & Act
        const state = metricRules([excludeRule], clearRulesOfType({ ruleEffect: "flatten" }))

        // Assert
        expect(state).toEqual([excludeRule])
    })
})
