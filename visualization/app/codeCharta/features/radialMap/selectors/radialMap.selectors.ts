import { createSelector } from "@ngrx/store"
import { buildRadialTree, RadialColoring, RadialMetrics } from "../../../renderer/radialMap/radialMap.facade"
import {
    accumulatedDataSelector,
    flattenPredicateSelector,
    metricRangeSelector,
    pathToNodeSelector
} from "../../../renderer/renderModel/renderModel.facade"
import {
    areaMetricSelector,
    colorMetricSelector,
    colorModeSelector,
    colorRangeSelector,
    mapColorsSelector
} from "../../../stores/mapState/mapState.read.facade"
import { currentFocusedNodePathSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { UNARY_METRIC } from "../../../util/metric/unaryMetric"

export const radialMetricsSelector = createSelector(
    areaMetricSelector,
    colorMetricSelector,
    (areaMetric, colorMetric): RadialMetrics => ({ areaMetric, colorMetric })
)

export const radialTreeSelector = createSelector(
    accumulatedDataSelector,
    pathToNodeSelector,
    currentFocusedNodePathSelector,
    radialMetricsSelector,
    flattenPredicateSelector,
    ({ unifiedMapNode }, pathToNode, focusedNodePath, metrics, isFlat) => {
        const root = (focusedNodePath && pathToNode.get(focusedNodePath)) || unifiedMapNode
        return root ? buildRadialTree(root, metrics, isFlat) : null
    }
)

export const radialColoringSelector = createSelector(
    colorMetricSelector,
    colorRangeSelector,
    colorModeSelector,
    mapColorsSelector,
    metricRangeSelector,
    (colorMetric, colorRange, colorMode, mapColors, colorMetricRange): RadialColoring => ({
        isUnaryMetric: colorMetric === UNARY_METRIC,
        colorRange,
        colorMode,
        mapColors,
        colorMetricRange
    })
)
