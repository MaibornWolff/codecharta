import { CodeMapNode } from "../../../model/codeCharta.model"
import { isLeaf } from "../../../util/codeMapHelper"

export interface RadialNode {
    path: string
    name: string
    isFile: boolean
    area: number
    colorValue: number | undefined
    isFlat: boolean
    children: RadialNode[]
}

export interface RadialMetrics {
    areaMetric: string
    colorMetric: string
}

type IsFlat = (node: CodeMapNode) => boolean

export function buildRadialTree(root: CodeMapNode, metrics: RadialMetrics, isFlat: IsFlat): RadialNode | null {
    if (isLeaf(root)) {
        return null
    }
    const tree = toFolder(root, metrics, isFlat)
    return tree.area > 0 ? tree : null
}

function toFolder(node: CodeMapNode, metrics: RadialMetrics, isFlat: IsFlat): RadialNode {
    const children = node.children
        .filter(child => !child.isExcluded)
        .map(child => (isLeaf(child) ? toFile(child, metrics, isFlat) : toFolder(child, metrics, isFlat)))
        .filter(child => child.area > 0)
    const area = children.reduce((sum, child) => sum + child.area, 0)
    return { ...describe(node, metrics, isFlat), isFile: false, area, children }
}

function toFile(node: CodeMapNode, metrics: RadialMetrics, isFlat: IsFlat): RadialNode {
    return { ...describe(node, metrics, isFlat), isFile: true, area: node.attributes?.[metrics.areaMetric] ?? 0, children: [] }
}

function describe(node: CodeMapNode, metrics: RadialMetrics, isFlat: IsFlat) {
    return { path: node.path, name: node.name, colorValue: node.attributes?.[metrics.colorMetric], isFlat: isFlat(node) }
}

export function levelsBelow(node: RadialNode, maxDepth: number, counts: (child: RadialNode) => boolean = () => true): number {
    if (maxDepth === 0) {
        return 0
    }
    return node.children.filter(counts).reduce((deepest, child) => Math.max(deepest, 1 + levelsBelow(child, maxDepth - 1, counts)), 0)
}

export function findClosestFolder(root: RadialNode, path: string): RadialNode {
    const child = root.children.find(candidate => !candidate.isFile && isInside(path, candidate.path))
    return child ? findClosestFolder(child, path) : root
}

export function findClosestNode(root: RadialNode, path: string, maxDepth = Number.POSITIVE_INFINITY): RadialNode {
    const child = maxDepth > 0 ? root.children.find(candidate => isInside(path, candidate.path)) : undefined
    return child ? findClosestNode(child, path, maxDepth - 1) : root
}

export function isInside(path: string, folderPath: string): boolean {
    return path === folderPath || path.startsWith(`${folderPath}/`)
}

export function findParentFolder(root: RadialNode, path: string): RadialNode | undefined {
    const child = root.children.find(candidate => isInside(path, candidate.path))
    if (!child) {
        return undefined
    }
    return child.path === path ? root : findParentFolder(child, path)
}
