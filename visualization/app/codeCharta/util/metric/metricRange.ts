import { NodeMetricData } from "../../model/codeCharta.model"

/**
 * A metric's value bounds. A pure data shape in the util kernel so any layer — the composing render
 * model, the util color/label helpers and the mapState colorRange home — can reference it downward
 * without reaching UP into renderModel/ (Slice 15: `render-model-is-top-derived-layer`).
 */
export type MetricMinMax = {
    minValue: number
    maxValue: number
}

/**
 * The node-metric range emitted for the visible selection. Superset of `MetricMinMax` (adds `values`)
 * — identical to what `selectedColorMetricDataSelector` already returns, so consumers are drop-in.
 *
 * Lives in the util kernel (not the metrics lens) so the derived, view-state-aware selectors can compose
 * it without importing the lens facade — which would close a `state → facade → repo → store → state`
 * module cycle. The metrics lens still owns the DATA; this is a pure shape + reducer over it.
 */
export type MetricRange = MetricMinMax & {
    values: number[]
}

export function rangeOfMetric(nodeMetricData: NodeMetricData[], metric: string): MetricRange {
    const data = nodeMetricData.find(metricData => metricData.name === metric)
    return {
        values: data?.values ?? [],
        minValue: data?.minValue ?? 0,
        maxValue: data?.maxValue ?? 0
    }
}
