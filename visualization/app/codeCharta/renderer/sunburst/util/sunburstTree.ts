import { CodeMapNode } from "../../../model/codeCharta.model"
import { isLeaf } from "../../../util/codeMapHelper"

export interface SunburstNode {
    path: string
    name: string
    isFile: boolean
    area: number
    colorValue: number | undefined
    isFlat: boolean
    children: SunburstNode[]
}

export interface SunburstMetrics {
    areaMetric: string
    colorMetric: string
}

type IsFlat = (node: CodeMapNode) => boolean

export function buildSunburstTree(root: CodeMapNode, metrics: SunburstMetrics, isFlat: IsFlat): SunburstNode | null {
    if (isLeaf(root)) {
        return null
    }
    const tree = toFolder(root, metrics, isFlat)
    return tree.area > 0 ? tree : null
}

function toFolder(node: CodeMapNode, metrics: SunburstMetrics, isFlat: IsFlat): SunburstNode {
    const children = node.children
        .filter(child => !child.isExcluded)
        .map(child => (isLeaf(child) ? toFile(child, metrics, isFlat) : toFolder(child, metrics, isFlat)))
        .filter(child => child.area > 0)
    const area = children.reduce((sum, child) => sum + child.area, 0)
    return { ...describe(node, metrics, isFlat), isFile: false, area, children }
}

function toFile(node: CodeMapNode, metrics: SunburstMetrics, isFlat: IsFlat): SunburstNode {
    return { ...describe(node, metrics, isFlat), isFile: true, area: node.attributes?.[metrics.areaMetric] ?? 0, children: [] }
}

function describe(node: CodeMapNode, metrics: SunburstMetrics, isFlat: IsFlat) {
    return { path: node.path, name: node.name, colorValue: node.attributes?.[metrics.colorMetric], isFlat: isFlat(node) }
}

export function findFolder(root: SunburstNode, path: string): SunburstNode | undefined {
    const node = findClosestNode(root, path)
    return node.path === path && !node.isFile ? node : undefined
}

export function findClosestFolder(root: SunburstNode, path: string): SunburstNode {
    const child = root.children.find(candidate => !candidate.isFile && isInside(path, candidate.path))
    return child ? findClosestFolder(child, path) : root
}

export function findClosestNode(root: SunburstNode, path: string, maxDepth = Number.POSITIVE_INFINITY): SunburstNode {
    const child = maxDepth > 0 ? root.children.find(candidate => isInside(path, candidate.path)) : undefined
    return child ? findClosestNode(child, path, maxDepth - 1) : root
}

export function isInside(path: string, folderPath: string): boolean {
    return path === folderPath || path.startsWith(`${folderPath}/`)
}

export function parentPath(path: string): string {
    return path.slice(0, path.lastIndexOf("/"))
}
