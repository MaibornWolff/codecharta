import { createSelector } from "@ngrx/store"
import {
    accumulatedDataSelector,
    flattenPredicateSelector,
    metricRangeSelector,
    pathToNodeSelector
} from "../../../renderer/renderModel/renderModel.facade"
import { buildSunburstTree, SunburstColoring, SunburstMetrics } from "../../../renderer/sunburst/sunburst.facade"
import {
    areaMetricSelector,
    colorMetricSelector,
    colorModeSelector,
    colorRangeSelector,
    mapColorsSelector
} from "../../../stores/mapState/mapState.read.facade"
import { currentFocusedNodePathSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { UNARY_METRIC } from "../../../util/metric/unaryMetric"

export const sunburstMetricsSelector = createSelector(
    areaMetricSelector,
    colorMetricSelector,
    (areaMetric, colorMetric): SunburstMetrics => ({ areaMetric, colorMetric })
)

export const sunburstTreeSelector = createSelector(
    accumulatedDataSelector,
    pathToNodeSelector,
    currentFocusedNodePathSelector,
    sunburstMetricsSelector,
    flattenPredicateSelector,
    ({ unifiedMapNode }, pathToNode, focusedNodePath, metrics, isFlat) => {
        const root = (focusedNodePath && pathToNode.get(focusedNodePath)) || unifiedMapNode
        return root ? buildSunburstTree(root, metrics, isFlat) : null
    }
)

export const sunburstColoringSelector = createSelector(
    colorMetricSelector,
    colorRangeSelector,
    colorModeSelector,
    mapColorsSelector,
    metricRangeSelector,
    (colorMetric, colorRange, colorMode, mapColors, colorMetricRange): SunburstColoring => ({
        isUnaryMetric: colorMetric === UNARY_METRIC,
        colorRange,
        colorMode,
        mapColors,
        colorMetricRange
    })
)
