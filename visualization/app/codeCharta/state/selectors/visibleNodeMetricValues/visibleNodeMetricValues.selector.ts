import { createSelector } from "@ngrx/store"
import { CodeMapNode } from "../../../codeCharta.model"
import { isLeaf } from "../../../util/codeMapHelper"
import { areaMetricSelector } from "../../store/dynamicSettings/areaMetric/areaMetric.selector"
import { colorMetricSelector } from "../../store/dynamicSettings/colorMetric/colorMetric.selector"
import { focusedNodePathSelector } from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.selector"
import { heightMetricSelector } from "../../store/dynamicSettings/heightMetric/heightMetric.selector"
import { accumulatedDataSelector } from "../accumulatedData/accumulatedData.selector"
import { hoveredNodeSelector } from "../hoveredNode.selector"
import { selectedNodeSelector } from "../selectedNode.selector"

export interface VisibleMetricValues {
    values: number[]
    minValue: number
    maxValue: number
}

export type VisibleNodeMetricValues = Record<string, VisibleMetricValues>

const EMPTY: VisibleNodeMetricValues = Object.freeze({}) as VisibleNodeMetricValues

// Derive the hovered/selected *folder* paths first: leaves cannot change the histogram,
// so these memoization barriers keep building hovers (10-30/s while sweeping the map)
// from re-walking the whole map on every mousemove.
const hoveredFolderPathSelector = createSelector(hoveredNodeSelector, hoveredNode =>
    hoveredNode?.children && hoveredNode.children.length > 0 && hoveredNode.path ? hoveredNode.path : null
)

const selectedFolderPathSelector = createSelector(selectedNodeSelector, selectedNode =>
    selectedNode?.children && selectedNode.children.length > 0 && selectedNode.path ? selectedNode.path : null
)

export const visibleNodeMetricValuesSelector = createSelector(
    accumulatedDataSelector,
    focusedNodePathSelector,
    hoveredFolderPathSelector,
    selectedFolderPathSelector,
    areaMetricSelector,
    heightMetricSelector,
    colorMetricSelector,
    (
        accumulatedData,
        focusedNodePath,
        hoveredFolderPath,
        selectedFolderPath,
        areaMetric,
        heightMetric,
        colorMetric
    ): VisibleNodeMetricValues => {
        const root = accumulatedData.unifiedMapNode
        if (!root) {
            return EMPTY
        }
        // only the metrics actually displayed in the metrics bar are collected
        const metrics = [...new Set([areaMetric, heightMetric, colorMetric])].filter(Boolean) as string[]
        if (metrics.length === 0) {
            return EMPTY
        }
        const prefix = resolvePathPrefix(hoveredFolderPath, selectedFolderPath, focusedNodePath)
        const result: Record<string, VisibleMetricValues> = {}

        collectMetrics(root, prefix, metrics, result)

        return result
    }
)

// Mirrors the metrics bar's display precedence (hovered ?? selected ?? top level): while a
// folder is selected, the histograms stay pinned to it just like the displayed metric values.
function resolvePathPrefix(hoveredFolderPath: string | null, selectedFolderPath: string | null, focusedNodePath: string[]): string | null {
    const focusPrefix = focusedNodePath.length > 0 ? focusedNodePath[0] : null
    for (const candidate of [hoveredFolderPath, selectedFolderPath]) {
        // a folder narrows the histogram only when it lies inside the focused subtree:
        // the file explorer shows the full tree, but only the focused part is rendered,
        // so hovering outside of it must not widen the histogram
        if (candidate && (!focusPrefix || candidate === focusPrefix || candidate.startsWith(`${focusPrefix}/`))) {
            return candidate
        }
    }
    return focusPrefix
}

function collectMetrics(node: CodeMapNode, pathPrefix: string | null, metrics: string[], result: Record<string, VisibleMetricValues>) {
    if (!isLeaf(node)) {
        for (const child of node.children) {
            collectMetrics(child, pathPrefix, metrics, result)
        }
        return
    }

    if (!isNodeVisibleForHistogram(node, pathPrefix) || !node.attributes) {
        return
    }
    for (const metric of metrics) {
        accumulateMetricValue(result, metric, node.attributes[metric])
    }
}

function accumulateMetricValue(result: Record<string, VisibleMetricValues>, metric: string, value: number) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return
    }

    let entry = result[metric]
    if (!entry) {
        entry = { values: [], minValue: value, maxValue: value }
        result[metric] = entry
    }
    entry.values.push(value)
    if (value < entry.minValue) {
        entry.minValue = value
    }
    if (value > entry.maxValue) {
        entry.maxValue = value
    }
}

function isNodeVisibleForHistogram(node: CodeMapNode, pathPrefix: string | null): boolean {
    if (node.isExcluded || node.isFlattened) {
        return false
    }
    if (pathPrefix && node.path && node.path !== pathPrefix && !node.path.startsWith(`${pathPrefix}/`)) {
        return false
    }
    return true
}
