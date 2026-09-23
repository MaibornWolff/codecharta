import { createSelector } from "@ngrx/store"
import { RadialFolderValue } from "../../../model/codeCharta.model"
import { buildRadialTree, calculateFolderValues, RadialColoring, RadialMetrics } from "../../../renderer/radialMap/radialMap.facade"
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
    flattenPredicateSelector,
    ({ unifiedMapNode }, pathToNode, focusedNodePath, metrics, isFlat) => {
        const root = (focusedNodePath && pathToNode.get(focusedNodePath)) || unifiedMapNode
        return root ? buildRadialTree(root, metrics, isFlat) : null
    }
)

const redThresholdSelector = createSelector(radialFolderValueSelector, colorRangeSelector, (folderValue, colorRange) =>
    folderValue === RadialFolderValue.ShareOfRed ? colorRange.to : null
)

export const radialFolderValuesSelector = createSelector(
    accumulatedDataSelector,
    radialMetricsSelector,
    radialFolderValueSelector,
    redThresholdSelector,
    ({ unifiedMapNode }, metrics, folderValue, redThreshold): ReadonlyMap<string, number> =>
        unifiedMapNode ? calculateFolderValues(unifiedMapNode, { ...metrics, folderValue, redThreshold }) : new Map()
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
