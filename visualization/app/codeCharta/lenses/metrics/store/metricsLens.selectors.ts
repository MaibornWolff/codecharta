import { createSelector } from "@ngrx/store"
import { NodeMetricData } from "../../../codeCharta.model"
import { calculateNodeMetricData } from "./nodeMetricData.calculator"
import { blacklistMatcherSelector } from "../../../state/store/fileSettings/blacklist/blacklistMatcher.selector"
import { colorMetricSelector } from "../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { visibleFileStatesSelector } from "../../../fileStore/store/visibleFileStates.selector"

/**
 * The node-metric range emitted for the visible selection. Superset of `MetricMinMax` (adds `values`)
 * — identical to what `selectedColorMetricDataSelector` already returns, so consumers are drop-in.
 */
export type MetricRange = {
    values: number[]
    minValue: number
    maxValue: number
}

/**
 * Node metrics for the visible selection. Inputs are EXACTLY `visibleFileStates` + `blacklistMatcher`
 * (the two `calculateNodeMetricData` consumes) so the selector's memoization matches today's
 * `metricDataSelector`. Edge metrics stay on the legacy `metricDataSelector` (dependency lens, later).
 */
export const nodeMetricDataSelector = createSelector(visibleFileStatesSelector, blacklistMatcherSelector, calculateNodeMetricData)

export function rangeOfMetric(nodeMetricData: NodeMetricData[], metric: string): MetricRange {
    const data = nodeMetricData.find(metricData => metricData.name === metric)
    return {
        values: data?.values ?? [],
        minValue: data?.minValue ?? 0,
        maxValue: data?.maxValue ?? 0
    }
}

/** Node-only re-implementation of `selectedColorMetricDataSelector`: the range of the color metric. */
export const metricRangeSelector = createSelector(nodeMetricDataSelector, colorMetricSelector, rangeOfMetric)
