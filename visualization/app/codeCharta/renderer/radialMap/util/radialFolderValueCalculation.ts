import { CodeMapNode, RadialFolderValue } from "../../../model/codeCharta.model"
import { isLeaf } from "../../../util/codeMapHelper"

export interface FolderValueInputs {
    areaMetric: string
    colorMetric: string
    folderValue: RadialFolderValue
}

interface FolderStats {
    files: number
    sum: number
    max: number
    min: number
    area: number
    areaWeightedSum: number
    values: number[]
}

type FolderValueOf = (stats: FolderStats) => number

const FOLDER_VALUE_OF: Record<RadialFolderValue, FolderValueOf> = {
    [RadialFolderValue.Sum]: stats => stats.sum,
    [RadialFolderValue.Max]: stats => stats.max,
    [RadialFolderValue.Min]: stats => stats.min,
    [RadialFolderValue.Median]: stats => median(stats.values),
    [RadialFolderValue.MeanPerFile]: stats => stats.sum / stats.files,
    [RadialFolderValue.AvgPerArea]: stats => stats.areaWeightedSum / stats.area
}

/** Every folder's value over all its files with an area and a colour value, keyed by path. */
export function calculateFolderValues(root: CodeMapNode, inputs: FolderValueInputs): ReadonlyMap<string, number> {
    const statsByPath = new Map<string, FolderStats>()
    collectStats(root, inputs, statsByPath)
    const folderValueOf = FOLDER_VALUE_OF[inputs.folderValue]
    const folderValues = new Map<string, number>()
    for (const [path, stats] of statsByPath) {
        if (stats.files > 0) {
            folderValues.set(path, folderValueOf(stats))
        }
    }
    return folderValues
}

function collectStats(node: CodeMapNode, inputs: FolderValueInputs, statsByPath: Map<string, FolderStats>): FolderStats {
    if (isLeaf(node)) {
        return fileStats(node, inputs)
    }
    const stats = emptyStats()
    for (const child of node.children) {
        if (!child.isExcluded) {
            addStats(stats, collectStats(child, inputs, statsByPath))
        }
    }
    statsByPath.set(node.path, stats)
    return stats
}

function fileStats(file: CodeMapNode, { areaMetric, colorMetric, folderValue }: FolderValueInputs): FolderStats {
    const area = file.attributes?.[areaMetric] ?? 0
    const value = file.attributes?.[colorMetric]
    if (area <= 0 || value === undefined) {
        return emptyStats()
    }
    return {
        files: 1,
        sum: value,
        max: value,
        min: value,
        area,
        areaWeightedSum: value * area,
        values: folderValue === RadialFolderValue.Median ? [value] : []
    }
}

function emptyStats(): FolderStats {
    return { files: 0, sum: 0, max: Number.NEGATIVE_INFINITY, min: Number.POSITIVE_INFINITY, area: 0, areaWeightedSum: 0, values: [] }
}

function addStats(stats: FolderStats, childStats: FolderStats) {
    stats.files += childStats.files
    stats.sum += childStats.sum
    stats.max = Math.max(stats.max, childStats.max)
    stats.min = Math.min(stats.min, childStats.min)
    stats.area += childStats.area
    stats.areaWeightedSum += childStats.areaWeightedSum
    for (const value of childStats.values) {
        stats.values.push(value)
    }
}

function median(values: number[]): number {
    const sorted = [...values].sort((first, second) => first - second)
    const middle = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}
