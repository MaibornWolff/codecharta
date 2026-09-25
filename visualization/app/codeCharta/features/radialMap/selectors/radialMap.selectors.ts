import { createSelector } from "@ngrx/store"
import { buildRadialTree, calculateFolderValues, RadialColoring, RadialMetrics } from "../../../renderer/radialMap/radialMap.facade"
import {
    accumulatedDataSelector,
    mapFlattenPredicateSelector,
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
import {
    radialFolderStyleSelector,
    radialFolderTintSelector,
    radialFolderValueSelector
} from "../../../stores/preferences/preferences.read.facade"
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
    mapFlattenPredicateSelector,
    ({ unifiedMapNode }, pathToNode, focusedNodePath, metrics, isFlat) => {
        const root = (focusedNodePath && pathToNode.get(focusedNodePath)) || unifiedMapNode
        return root ? buildRadialTree(root, metrics, isFlat) : null
    }
)

export const radialFolderValuesSelector = createSelector(
    accumulatedDataSelector,
    radialMetricsSelector,
    radialFolderValueSelector,
    mapFlattenPredicateSelector,
    ({ unifiedMapNode }, metrics, folderValue, isFlat): ReadonlyMap<string, number> =>
        unifiedMapNode ? calculateFolderValues(unifiedMapNode, { ...metrics, folderValue, isFlat }) : new Map()
)

const radialFolderColoringSelector = createSelector(
    radialFolderValuesSelector,
    radialFolderValueSelector,
    radialFolderStyleSelector,
    radialFolderTintSelector,
    (values, value, style, tint) => ({ values, value, style, tint })
)

export const radialColoringSelector = createSelector(
    colorMetricSelector,
    colorRangeSelector,
    colorModeSelector,
    mapColorsSelector,
    metricRangeSelector,
    radialFolderColoringSelector,
    (colorMetric, colorRange, colorMode, mapColors, colorMetricRange, folders): RadialColoring => ({
        isUnaryMetric: colorMetric === UNARY_METRIC,
        colorRange,
        colorMode,
        mapColors,
        colorMetricRange,
        folders
    })
)
