import { createSelector } from "@ngrx/store"
import { RuleWithCount } from "../../../features/sidebarExplorer/facade"
import { BlacklistType, CodeMapNode, MetricRule } from "../../../model/codeCharta.model"
import { metricRulesSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { describeMetricRule } from "../../../util/metricRule/describeMetricRule"
import { createMetricRuleMatcher } from "../../../util/metricRule/metricRuleMatcher"
import { metricRuleLeavesSelector } from "./metricRuleLeaves.selector"

const countFilesMatching = (rule: MetricRule, leaves: CodeMapNode[]): number => {
    const matcher = createMetricRuleMatcher([rule])
    let count = 0
    for (const leaf of leaves) {
        const { isFlattened, isExcluded } = matcher.classify(leaf.attributes)
        if (isFlattened || isExcluded) {
            count++
        }
    }
    return count
}

const buildMetricRulesWithCount = (rules: MetricRule[], leaves: CodeMapNode[], type: BlacklistType): RuleWithCount[] =>
    rules
        .filter(rule => rule.type === type)
        .map(rule => ({
            id: rule.id,
            label: describeMetricRule(rule),
            affectedCount: countFilesMatching(rule, leaves),
            kind: "METRIC" as const,
            metricRule: rule
        }))

export const flattenMetricRulesWithCountSelector = createSelector(metricRulesSelector, metricRuleLeavesSelector, (rules, leaves) =>
    buildMetricRulesWithCount(rules, leaves, "flatten")
)

export const excludeMetricRulesWithCountSelector = createSelector(metricRulesSelector, metricRuleLeavesSelector, (rules, leaves) =>
    buildMetricRulesWithCount(rules, leaves, "exclude")
)
