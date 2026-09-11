import { KeyValuePair, MetricRule } from "../../model/codeCharta.model"

/** Just the condition of a rule — what a draft in the editor has before it is added. */
export type MetricRuleCondition = Pick<MetricRule, "operator" | "value" | "upperValue">

interface MetricRuleClassification {
    isFlattened: boolean
    isExcluded: boolean
}

export interface MetricRuleMatcher {
    /** Metric rules address files by their own values, so folders are never passed in here. */
    classify(attributes: KeyValuePair | undefined): MetricRuleClassification
}

const NOTHING_MATCHED: MetricRuleClassification = { isFlattened: false, isExcluded: false }

/** A file without a value for a metric on the map is read as 0, the value the map shows for it. */
export function createMetricRuleMatcher(rules: MetricRule[], metricsOnMap: ReadonlySet<string>): MetricRuleMatcher {
    if (rules.length === 0) {
        return { classify: () => NOTHING_MATCHED }
    }

    return {
        classify: attributes => {
            let isFlattened = false
            let isExcluded = false
            for (const rule of rules) {
                const value = metricsOnMap.has(rule.metric) ? (attributes?.[rule.metric] ?? 0) : undefined
                if (!matchesMetricRule(rule, value)) {
                    continue
                }
                if (rule.type === "flatten") {
                    isFlattened = true
                } else {
                    isExcluded = true
                }
            }
            return { isFlattened, isExcluded }
        }
    }
}

export function matchesMetricRule(rule: MetricRuleCondition, value: number | undefined): boolean {
    if (typeof value !== "number" || Number.isNaN(value)) {
        return false
    }
    switch (rule.operator) {
        case "gt":
            return value > rule.value
        case "gte":
            return value >= rule.value
        case "lt":
            return value < rule.value
        case "lte":
            return value <= rule.value
        case "eq":
            return value === rule.value
        case "between":
            return matchesRange(rule, value)
    }
}

function matchesRange(rule: MetricRuleCondition, value: number): boolean {
    if (typeof rule.upperValue !== "number" || Number.isNaN(rule.upperValue)) {
        return false
    }
    const lowerBound = Math.min(rule.value, rule.upperValue)
    const upperBound = Math.max(rule.value, rule.upperValue)
    return value >= lowerBound && value <= upperBound
}
