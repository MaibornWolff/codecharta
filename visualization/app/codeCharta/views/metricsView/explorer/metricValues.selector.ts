import { createSelector } from "@ngrx/store"
import { MetricValues } from "../../../features/sidebarExplorer/facade"
import { UNARY_METRIC } from "../../../util/metric/unaryMetric"
import { metricRuleLeavesSelector } from "./metricRuleLeaves.selector"

export const metricValuesSelector = createSelector(metricRuleLeavesSelector, (leaves): MetricValues => {
    const valuesByMetric = new Map<string, number[]>()
    for (const leaf of leaves) {
        for (const [metric, value] of Object.entries(leaf.attributes ?? {})) {
            // Every file is one unary, so a rule on it can only match all or nothing.
            if (metric === UNARY_METRIC || typeof value !== "number" || Number.isNaN(value)) {
                continue
            }
            const values = valuesByMetric.get(metric)
            if (values === undefined) {
                valuesByMetric.set(metric, [value])
            } else {
                values.push(value)
            }
        }
    }
    return valuesByMetric
})
