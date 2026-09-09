import { BlacklistItem, MetricRule } from "../../../../model/codeCharta.model"
import { blacklist } from "../blacklist/blacklist.reducer"
import { metricRules } from "../metricRules/metricRules.reducer"
import { clearRulesOfType } from "./rules.actions"

const flattenItem: BlacklistItem = { path: "**/*.spec.ts", type: "flatten" }
const excludeItem: BlacklistItem = { path: "node_modules", type: "exclude" }
const flattenRule: MetricRule = { id: "a", metric: "mcc", operator: "gt", value: 10, type: "flatten" }
const excludeRule: MetricRule = { id: "b", metric: "rloc", operator: "lt", value: 5, type: "exclude" }

describe("clearRulesOfType", () => {
    it("should empty the blacklist of that type only", () => {
        // Arrange & Act
        const state = blacklist([flattenItem, excludeItem], clearRulesOfType({ blacklistType: "flatten" }))

        // Assert
        expect(state).toEqual([excludeItem])
    })

    it("should empty the metric rules of that type only", () => {
        // Arrange & Act
        const state = metricRules([flattenRule, excludeRule], clearRulesOfType({ blacklistType: "flatten" }))

        // Assert
        expect(state).toEqual([excludeRule])
    })

    it("should clear both kinds of rule in one step, because one list holds both", () => {
        // Arrange & Act
        const remainingItems = blacklist([flattenItem], clearRulesOfType({ blacklistType: "flatten" }))
        const remainingRules = metricRules([flattenRule], clearRulesOfType({ blacklistType: "flatten" }))

        // Assert
        expect(remainingItems).toEqual([])
        expect(remainingRules).toEqual([])
    })

    it("should leave the hidden list alone when the flattened one is cleared", () => {
        // Arrange & Act
        const state = metricRules([excludeRule], clearRulesOfType({ blacklistType: "flatten" }))

        // Assert
        expect(state).toEqual([excludeRule])
    })
})
