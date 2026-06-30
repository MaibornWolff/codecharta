import { createSelector } from "@ngrx/store"
import { metricRangeSelector } from "../../../lenses/metrics/metricsLens.facade"
import { colorRangeSelector } from "../../../state/store/dynamicSettings/colorRange/colorRange.selector"

export const metricColorRangeValuesSelector = createSelector(
    metricRangeSelector,
    colorRangeSelector,
    (colorMetricData, colorRange) => ({
        values: colorMetricData.values,
        min: colorMetricData.minValue,
        max: colorMetricData.maxValue,
        from: colorRange.from,
        to: colorRange.to
    })
)
