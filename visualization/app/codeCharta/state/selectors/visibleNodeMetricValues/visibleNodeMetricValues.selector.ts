import { createSelector } from "@ngrx/store"
import { CodeMapNode } from "../../../codeCharta.model"
import { focusedNodePathSelector } from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.selector"
import { accumulatedDataSelector } from "../accumulatedData/accumulatedData.selector"
import { hoveredNodeSelector } from "../hoveredNode.selector"

export interface VisibleMetricValues {
    values: number[]
    minValue: number
    maxValue: number
    sum: number
}

export type VisibleNodeMetricValues = Record<string, VisibleMetricValues>

const EMPTY: VisibleNodeMetricValues = Object.freeze({}) as VisibleNodeMetricValues

export const visibleNodeMetricValuesSelector = createSelector(
    accumulatedDataSelector,
    focusedNodePathSelector,
    hoveredNodeSelector,
    (accumulatedData, focusedNodePath, hoveredNode): VisibleNodeMetricValues => {
        const root = accumulatedData.unifiedMapNode
        if (!root) {
            return EMPTY
        }
        const prefix = resolvePathPrefix(hoveredNode, focusedNodePath)
        const result: Record<string, VisibleMetricValues> = {}

        collectMetrics(root, prefix, result)

        return result
    }
)

function resolvePathPrefix(hoveredNode: CodeMapNode | undefined, focusedNodePath: string[]): string | null {
    const focusPrefix = focusedNodePath.length > 0 ? focusedNodePath[0] : null
    if (hoveredNode?.children && hoveredNode.children.length > 0 && hoveredNode.path) {
        // a hovered folder narrows the histogram only when it lies inside the focused
        // subtree: the file explorer shows the full tree, but only the focused part is
        // rendered, so hovering outside of it must not widen the histogram
        if (!focusPrefix || hoveredNode.path === focusPrefix || hoveredNode.path.startsWith(`${focusPrefix}/`)) {
            return hoveredNode.path
        }
    }
    return focusPrefix
}

function collectMetrics(node: CodeMapNode, pathPrefix: string | null, result: Record<string, VisibleMetricValues>) {
    const isLeafNode = !node.children || node.children.length === 0
    if (!isLeafNode) {
        for (const child of node.children) {
            collectMetrics(child, pathPrefix, result)
        }
        return
    }

    if (!isNodeVisibleForHistogram(node, pathPrefix) || !node.attributes) {
        return
    }
    for (const metric in node.attributes) {
        accumulateMetricValue(result, metric, node.attributes[metric])
    }
}

function accumulateMetricValue(result: Record<string, VisibleMetricValues>, metric: string, value: number) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return
    }

    let entry = result[metric]
    if (!entry) {
        entry = { values: [], minValue: value, maxValue: value, sum: 0 }
        result[metric] = entry
    }
    entry.values.push(value)
    entry.sum += value
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
