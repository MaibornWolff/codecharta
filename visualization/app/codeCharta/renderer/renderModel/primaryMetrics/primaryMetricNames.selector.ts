import { createSelector } from "@ngrx/store"

import {
    areaMetricSelector,
    colorMetricSelector,
    edgeMetricSelector,
    heightMetricSelector
} from "../../../stores/mapState/mapState.read.facade"

export const primaryMetricNamesSelector = createSelector(
    areaMetricSelector,
    heightMetricSelector,
    colorMetricSelector,
    edgeMetricSelector,
    (areaMetric, heightMetric, colorMetric, edgeMetric) => ({
        areaMetric,
        heightMetric,
        colorMetric,
        edgeMetric
    })
)
