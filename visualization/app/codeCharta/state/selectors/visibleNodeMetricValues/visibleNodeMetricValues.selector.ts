import { createSelector } from "@ngrx/store"
import { CodeMapNode } from "../../../codeCharta.model"
import { isLeaf } from "../../../util/codeMapHelper"
import { areaMetricSelector } from "../../store/dynamicSettings/areaMetric/areaMetric.selector"
import { colorMetricSelector } from "../../store/dynamicSettings/colorMetric/colorMetric.selector"
import { focusedNodePathSelector } from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.selector"
import { heightMetricSelector } from "../../store/dynamicSettings/heightMetric/heightMetric.selector"
import { accumulatedDataSelector } from "../accumulatedData/accumulatedData.selector"
import { hoveredNodeSelector } from "../hoveredNode.selector"

export interface VisibleMetricValues {
    values: number[]
    minValue: number
    maxValue: number
}

export type VisibleNodeMetricValues = Record<string, VisibleMetricValues>

const EMPTY: VisibleNodeMetricValues = Object.freeze({}) as VisibleNodeMetricValues

// Derive the hovered *folder* path first: hovering a leaf cannot change the histogram,
// so this memoization barrier keeps building hovers (10-30/s while sweeping the map)
// from re-walking the whole map on every mousemove.
const hoveredFolderPathSelector = createSelector(hoveredNodeSelector, hoveredNode =>
    hoveredNode?.children && hoveredNode.children.length > 0 && hoveredNode.path ? hoveredNode.path : null
)

export const visibleNodeMetricValuesSelector = createSelector(
    accumulatedDataSelector,
    focusedNodePathSelector,
    hoveredFolderPathSelector,
    areaMetricSelector,
    heightMetricSelector,
    colorMetricSelector,
    (accumulatedData, focusedNodePath, hoveredFolderPath, areaMetric, heightMetric, colorMetric): VisibleNodeMetricValues => {
        const root = accumulatedData.unifiedMapNode
        if (!root) {
            return EMPTY
        }
        // only the metrics actually displayed in the metrics bar are collected
        const metrics = [...new Set([areaMetric, heightMetric, colorMetric])].filter(Boolean) as string[]
        if (metrics.length === 0) {
            return EMPTY
        }
        const prefix = resolvePathPrefix(hoveredFolderPath, focusedNodePath)
        const result: Record<string, VisibleMetricValues> = {}

        collectMetrics(root, prefix, metrics, result)

        return result
    }
)

function resolvePathPrefix(hoveredFolderPath: string | null, focusedNodePath: string[]): string | null {
    const focusPrefix = focusedNodePath.length > 0 ? focusedNodePath[0] : null
    if (hoveredFolderPath) {
        // a hovered folder narrows the histogram only when it lies inside the focused
        // subtree: the file explorer shows the full tree, but only the focused part is
        // rendered, so hovering outside of it must not widen the histogram
        if (!focusPrefix || hoveredFolderPath === focusPrefix || hoveredFolderPath.startsWith(`${focusPrefix}/`)) {
            return hoveredFolderPath
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
