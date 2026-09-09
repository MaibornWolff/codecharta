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

/**
 * Evaluates metric rules against one file's attributes. A file with no value for a rule's metric is
 * never matched: the decorator runs this before missing metrics are defaulted to 0, so "no data"
 * cannot be read as "zero" and quietly hide a whole language's files.
 */
export function createMetricRuleMatcher(rules: MetricRule[]): MetricRuleMatcher {
    if (rules.length === 0) {
        return { classify: () => NOTHING_MATCHED }
    }

    return {
        classify: attributes => {
            if (attributes === undefined) {
                return NOTHING_MATCHED
            }
            let isFlattened = false
            let isExcluded = false
            for (const rule of rules) {
                if (!matchesMetricRule(rule, attributes[rule.metric])) {
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
