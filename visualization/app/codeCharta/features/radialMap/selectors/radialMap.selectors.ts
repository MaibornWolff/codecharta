import { createSelector } from "@ngrx/store"
import {
    buildRadialTree,
    calculateFolderValues,
    filePathsWhere,
    RadialColoring,
    RadialHighlight,
    RadialMetrics,
    RadialNode
} from "../../../renderer/radialMap/radialMap.facade"
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
import {
    currentFocusedNodePathSelector,
    hoveredFileExtensionsSelector,
    keptHighlightPathsSelector,
    selectedNodePathSelector
} from "../../../stores/sharedView/sharedView.read.facade"
import { FileExtensionCalculator } from "../../../util/fileExtension/fileExtensionCalculator"
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

export const radialHighlightSelector = createSelector(
    selectedNodePathSelector,
    keptHighlightPathsSelector,
    hoveredFileExtensionsSelector,
    radialTreeSelector,
    (selectedPath, keptHighlightPaths, hoveredFileExtensions, tree): RadialHighlight => ({
        selectedPath,
        litPaths: new Set([...keptHighlightPaths, ...filesWithExtensions(tree, hoveredFileExtensions)])
    })
)

function filesWithExtensions(tree: RadialNode | null, extensions: string[]): Iterable<string> {
    if (!tree || extensions.length === 0) {
        return []
    }
    return filePathsWhere(tree, file => extensions.includes(FileExtensionCalculator.estimateFileExtension(file.name)))
}

export const radialColoringSelector = createSelector(
    colorMetricSelector,
    colorRangeSelector,
    colorModeSelector,
    mapColorsSelector,
    metricRangeSelector,
    radialFolderColoringSelector,
    radialHighlightSelector,
    (colorMetric, colorRange, colorMode, mapColors, colorMetricRange, folders, highlight): RadialColoring => ({
        isUnaryMetric: colorMetric === UNARY_METRIC,
        colorRange,
        colorMode,
        mapColors,
        colorMetricRange,
        folders,
        highlight
    })
)
