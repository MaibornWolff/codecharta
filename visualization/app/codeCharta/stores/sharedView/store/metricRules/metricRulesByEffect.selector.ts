import { createSelectorFactory, defaultMemoize } from "@ngrx/store"
import { MetricRule, RuleEffect } from "../../../../model/codeCharta.model"
import { metricRulesSelector } from "./metricRules.selector"

/**
 * Filtering the one rule list would hand out a fresh array on every change, so every consumer would
 * recompute whichever effect changed. Keeping the previous array while its rules are the same ones
 * is what lets a flatten rule leave the excluded side of the map alone.
 */
const holdsTheSameRules = (one: MetricRule[], other: MetricRule[]) =>
    one.length === other.length && one.every((rule, index) => rule === other[index])

const rulesWithEffect = (effect: RuleEffect) =>
    createSelectorFactory(projection => defaultMemoize(projection, holdsTheSameRules, holdsTheSameRules))(
        metricRulesSelector,
        (metricRules: MetricRule[]) => metricRules.filter(rule => rule.type === effect)
    ) as (state: object) => MetricRule[]

export const excludeMetricRulesSelector = rulesWithEffect("exclude")
export const flattenMetricRulesSelector = rulesWithEffect("flatten")
