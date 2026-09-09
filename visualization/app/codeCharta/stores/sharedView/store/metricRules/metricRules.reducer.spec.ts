import { MetricRule } from "../../../../model/codeCharta.model"
import { addMetricRule, removeMetricRule, setMetricRules } from "./metricRules.actions"
import { defaultMetricRules, metricRules } from "./metricRules.reducer"

const rule = (id: string, overrides: Partial<MetricRule> = {}): MetricRule => ({
    id,
    metric: "mcc",
    operator: "gt",
    value: 10,
    type: "flatten",
    ...overrides
})

describe("metricRules reducer", () => {
    it("should start with no rules", () => {
        // Arrange & Act
        const state = metricRules(undefined, { type: "@@init" })

        // Assert
        expect(state).toEqual(defaultMetricRules)
    })

    it("should replace every rule when the whole set is written", () => {
        // Arrange
        const value = [rule("a"), rule("b")]

        // Act
        const state = metricRules([rule("old")], setMetricRules({ value }))

        // Assert
        expect(state).toEqual(value)
    })

    it("should append an added rule", () => {
        // Arrange
        const existing = [rule("a")]

        // Act
        const state = metricRules(existing, addMetricRule({ rule: rule("b") }))

        // Assert
        expect(state.map(entry => entry.id)).toEqual(["a", "b"])
    })

    it("should keep several rules active at once", () => {
        // Arrange
        const withFirst = metricRules(defaultMetricRules, addMetricRule({ rule: rule("a") }))

        // Act
        const state = metricRules(withFirst, addMetricRule({ rule: rule("b", { type: "exclude" }) }))

        // Assert
        expect(state.length).toBe(2)
    })

    it("should ignore a rule whose id is already present", () => {
        // Arrange
        const existing = [rule("a")]

        // Act
        const state = metricRules(existing, addMetricRule({ rule: rule("a", { value: 99 }) }))

        // Assert
        expect(state).toBe(existing)
    })

    it("should remove the rule with the given id", () => {
        // Arrange
        const existing = [rule("a"), rule("b")]

        // Act
        const state = metricRules(existing, removeMetricRule({ id: "a" }))

        // Assert
        expect(state.map(entry => entry.id)).toEqual(["b"])
    })
})
