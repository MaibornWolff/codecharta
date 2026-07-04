import { createSelector } from "@ngrx/store"
import { metricRangeSelector } from "../../../renderModel/renderModel.facade"
import { colorRangeSelector } from "../../../mapState/store/colorRange/colorRange.selector"

export const metricColorRangeValuesSelector = createSelector(metricRangeSelector, colorRangeSelector, (colorMetricData, colorRange) => ({
    values: colorMetricData.values,
    min: colorMetricData.minValue,
    max: colorMetricData.maxValue,
    from: colorRange.from,
    to: colorRange.to
}))
