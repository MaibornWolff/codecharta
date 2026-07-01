import { metricRangeSelector } from "../../../../lenses/metrics/metricsLens.facade"

export type MetricMinMax = {
    minValue: number
    maxValue: number
}

/**
 * The color-metric range is OWNED by the metrics lens (`metricRangeSelector`). This historical name is
 * kept as a thin re-export so the render/effect consumers stay drop-in until a later slice points them
 * at the facade directly. Collapsing onto the lens selector removes the Slice-1 duplicate implementation.
 */
export const selectedColorMetricDataSelector = metricRangeSelector
