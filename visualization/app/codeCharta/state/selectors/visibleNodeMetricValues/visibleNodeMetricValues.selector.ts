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
    if (hoveredNode?.children && hoveredNode.children.length > 0 && hoveredNode.path) {
        return hoveredNode.path
    }
    return focusedNodePath.length > 0 ? focusedNodePath[0] : null
}

function collectMetrics(node: CodeMapNode, pathPrefix: string | null, result: Record<string, VisibleMetricValues>) {
    const isLeafNode = !node.children || node.children.length === 0
    if (isLeafNode) {
        if (isNodeVisibleForHistogram(node, pathPrefix) && node.attributes) {
            for (const metric in node.attributes) {
                const value = node.attributes[metric]
                if (typeof value !== "number" || !Number.isFinite(value)) {
                    continue
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
        }
        return
    }
    if (node.children) {
        for (const child of node.children) {
            collectMetrics(child, pathPrefix, result)
        }
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
