import { createSelector } from "@ngrx/store"
import {
    accumulatedDataSelector,
    flattenPredicateSelector,
    metricRangeSelector,
    pathToNodeSelector
} from "../../../renderer/renderModel/renderModel.facade"
import { buildSunburstFolders, SunburstColoring, SunburstMetrics } from "../../../renderer/sunburst/sunburst.facade"
import {
    areaMetricSelector,
    colorMetricSelector,
    colorModeSelector,
    colorRangeSelector,
    mapColorsSelector
} from "../../../stores/mapState/mapState.read.facade"
import { currentFocusedNodePathSelector } from "../../../stores/sharedView/sharedView.read.facade"

export const sunburstMetricsSelector = createSelector(
    areaMetricSelector,
    colorMetricSelector,
    (areaMetric, colorMetric): SunburstMetrics => ({ areaMetric, colorMetric })
)

export const sunburstFoldersSelector = createSelector(
    accumulatedDataSelector,
    pathToNodeSelector,
    currentFocusedNodePathSelector,
    sunburstMetricsSelector,
    flattenPredicateSelector,
    ({ unifiedMapNode }, pathToNode, focusedNodePath, metrics, isFlat) => {
        const root = (focusedNodePath && pathToNode.get(focusedNodePath)) || unifiedMapNode
        return root ? buildSunburstFolders(root, metrics, isFlat) : null
    }
)

export const sunburstColoringSelector = createSelector(
    colorMetricSelector,
    colorRangeSelector,
    colorModeSelector,
    mapColorsSelector,
    metricRangeSelector,
    (colorMetric, colorRange, colorMode, mapColors, colorMetricRange): SunburstColoring => ({
        colorMetric,
        colorRange,
        colorMode,
        mapColors,
        colorMetricRange
    })
)
