import { createSelector } from "@ngrx/store"
import { MetricValues, RuleWithCount } from "../../../features/sidebarExplorer/facade"
import { BlacklistType, MetricRule } from "../../../model/codeCharta.model"
import { metricRulesSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { describeMetricRule } from "../../../util/metricRule/describeMetricRule"
import { matchesMetricRule } from "../../../util/metricRule/metricRuleMatcher"
import { metricValuesSelector } from "./metricValues.selector"

const countFilesMatching = (rule: MetricRule, metricValues: MetricValues): number =>
    (metricValues.get(rule.metric) ?? []).filter(value => matchesMetricRule(rule, value)).length

const buildMetricRulesWithCount = (rules: MetricRule[], metricValues: MetricValues, type: BlacklistType): RuleWithCount[] =>
    rules
        .filter(rule => rule.type === type)
        .map(rule => ({
            id: rule.id,
            label: describeMetricRule(rule),
            affectedCount: countFilesMatching(rule, metricValues),
            kind: "METRIC" as const,
            metricRule: rule
        }))

export const flattenMetricRulesWithCountSelector = createSelector(metricRulesSelector, metricValuesSelector, (rules, metricValues) =>
    buildMetricRulesWithCount(rules, metricValues, "flatten")
)

export const excludeMetricRulesWithCountSelector = createSelector(metricRulesSelector, metricValuesSelector, (rules, metricValues) =>
    buildMetricRulesWithCount(rules, metricValues, "exclude")
)
