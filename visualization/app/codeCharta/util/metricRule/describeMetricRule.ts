import { MetricRule, MetricRuleOperator } from "../../model/codeCharta.model"

const OPERATOR_SYMBOLS: Record<Exclude<MetricRuleOperator, "between">, string> = {
    gt: ">",
    gte: "≥",
    lt: "<",
    lte: "≤",
    eq: "="
}

/** The rule as it reads in the rules list: what it removes, not how it is stored. */
export function describeMetricRule(rule: MetricRule): string {
    if (rule.operator === "between") {
        const lowerBound = Math.min(rule.value, rule.upperValue ?? rule.value)
        const upperBound = Math.max(rule.value, rule.upperValue ?? rule.value)
        return `${rule.metric} ${lowerBound}…${upperBound}`
    }
    return `${rule.metric} ${OPERATOR_SYMBOLS[rule.operator]} ${rule.value}`
}
