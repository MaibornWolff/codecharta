import { CodeMapNode } from "../../../model/codeCharta.model"
import { isLeaf } from "../../../util/codeMapHelper"

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

interface ColorAccumulator {
    weightedSum: number
    weight: number
}

interface FolderWithColorWeights {
    folder: SunburstFolder
    color: ColorAccumulator
}

export function buildSunburstFolders(root: CodeMapNode, metrics: SunburstMetrics, isFlat: IsFlat): SunburstFolder | null {
    if (isLeaf(root)) {
        return null
    }
    return summarizeFolder(root, metrics, isFlat).folder
}

function summarizeFolder(node: CodeMapNode, metrics: SunburstMetrics, isFlat: IsFlat): FolderWithColorWeights {
    const color: ColorAccumulator = { weightedSum: 0, weight: 0 }
    const children: SunburstFolder[] = []
    let area = 0

    for (const child of node.children) {
        if (isLeaf(child)) {
            area += addFile(child, metrics, isFlat, color)
            continue
        }
        const summary = summarizeFolder(child, metrics, isFlat)
        area += summary.folder.area
        color.weightedSum += summary.color.weightedSum
        color.weight += summary.color.weight
        if (summary.folder.area > 0) {
            children.push(summary.folder)
        }
    }

    const colorValue = color.weight > 0 ? color.weightedSum / color.weight : undefined
    return { folder: { path: node.path, name: node.name, area, colorValue, isFlat: isFlat(node), children }, color }
}

function addFile(file: CodeMapNode, metrics: SunburstMetrics, isFlat: IsFlat, color: ColorAccumulator): number {
    if (file.isExcluded) {
        return 0
    }
    const area = file.attributes?.[metrics.areaMetric] ?? 0
    const colorValue = file.attributes?.[metrics.colorMetric]
    if (area > 0 && colorValue !== undefined && !isFlat(file)) {
        color.weightedSum += colorValue * area
        color.weight += area
    }
    return area
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
