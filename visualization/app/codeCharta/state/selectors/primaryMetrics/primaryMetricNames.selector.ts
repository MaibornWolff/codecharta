import { createSelector } from "@ngrx/store"

import { areaMetricSelector } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { colorMetricSelector } from "../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { edgeMetricSelector } from "../../../state/store/dynamicSettings/edgeMetric/edgeMetric.selector"
import { heightMetricSelector } from "../../../state/store/dynamicSettings/heightMetric/heightMetric.selector"

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
