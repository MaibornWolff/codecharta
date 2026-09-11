import { createSelector } from "@ngrx/store"
import { MetricValues } from "../../../features/sidebarExplorer/facade"
import { CodeMapNode } from "../../../model/codeCharta.model"
import { UNARY_METRIC } from "../../../util/metric/unaryMetric"
import { metricRuleLeavesSelector } from "./metricRuleLeaves.selector"

/** One value per file for every metric some file has, 0 where a file has none — as the map shows it. */
export const metricValuesSelector = createSelector(metricRuleLeavesSelector, (leaves): MetricValues => {
    const valuesByMetric = new Map<string, number[]>()
    for (const metric of metricsOfLeaves(leaves)) {
        valuesByMetric.set(
            metric,
            leaves.map(leaf => leaf.attributes?.[metric] ?? 0).filter(value => typeof value === "number" && !Number.isNaN(value))
        )
    }
    return valuesByMetric
})

function metricsOfLeaves(leaves: CodeMapNode[]): Set<string> {
    const metrics = new Set<string>()
    for (const leaf of leaves) {
        for (const metric of Object.keys(leaf.attributes ?? {})) {
            // Every file is one unary, so a rule on it can only match all or nothing.
            if (metric !== UNARY_METRIC) {
                metrics.add(metric)
            }
        }
    }
    return metrics
}
