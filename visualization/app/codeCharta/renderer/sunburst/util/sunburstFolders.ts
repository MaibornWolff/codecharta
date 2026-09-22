import { CodeMapNode } from "../../../model/codeCharta.model"
import { isLeaf } from "../../../util/codeMapHelper"
import { MetricMinMax } from "../../../util/metric/metricRange"

export interface SunburstFolder {
    path: string
    name: string
    area: number
    colorValue: number | undefined
    isFlat: boolean
    children: SunburstFolder[]
}

export interface SunburstMetrics {
    areaMetric: string
    colorMetric: string
}

type IsFlat = (node: CodeMapNode) => boolean

export function buildSunburstFolders(root: CodeMapNode, metrics: SunburstMetrics, isFlat: IsFlat): SunburstFolder | null {
    return isLeaf(root) ? null : summarizeFolder(root, metrics, isFlat)
}

function summarizeFolder(node: CodeMapNode, metrics: SunburstMetrics, isFlat: IsFlat): SunburstFolder {
    const children: SunburstFolder[] = []
    let area = 0

    for (const child of node.children) {
        if (isLeaf(child)) {
            area += child.isExcluded ? 0 : (child.attributes?.[metrics.areaMetric] ?? 0)
            continue
        }
        const folder = summarizeFolder(child, metrics, isFlat)
        area += folder.area
        if (folder.area > 0) {
            children.push(folder)
        }
    }

    const colorValue = node.attributes?.[metrics.colorMetric]
    return { path: node.path, name: node.name, area, colorValue, isFlat: isFlat(node), children }
}

export function colorValueRange(root: SunburstFolder): MetricMinMax | null {
    const colorValues = collectColorValues(root, [])
    if (colorValues.length === 0) {
        return null
    }
    return { minValue: Math.min(...colorValues), maxValue: Math.max(...colorValues) }
}

function collectColorValues(folder: SunburstFolder, colorValues: number[]): number[] {
    if (folder.colorValue !== undefined) {
        colorValues.push(folder.colorValue)
    }
    for (const child of folder.children) {
        collectColorValues(child, colorValues)
    }
    return colorValues
}

export function findFolder(root: SunburstFolder, path: string): SunburstFolder | undefined {
    if (root.path === path) {
        return root
    }
    const child = root.children.find(candidate => isInside(path, candidate.path))
    return child ? findFolder(child, path) : undefined
}

export function findClosestFolder(root: SunburstFolder, path: string, maxDepth = Number.POSITIVE_INFINITY): SunburstFolder {
    const child = maxDepth > 0 ? root.children.find(candidate => isInside(path, candidate.path)) : undefined
    return child ? findClosestFolder(child, path, maxDepth - 1) : root
}

export function isInside(path: string, folderPath: string): boolean {
    return path === folderPath || path.startsWith(`${folderPath}/`)
}

export function parentPath(path: string): string {
    return path.slice(0, path.lastIndexOf("/"))
}
