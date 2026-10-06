import { LeveledNode } from "./leveledTree"

/** A leveled tree by path: each node under its own path and under those of the folders folded into it, and the
 * node drawn around each. */
export interface TreeIndex {
    root: LeveledNode
    nodeAt: ReadonlyMap<string, LeveledNode>
    parentOf: ReadonlyMap<string, LeveledNode>
}

export function indexTree(root: LeveledNode): TreeIndex {
    const nodeAt = new Map<string, LeveledNode>()
    const parentOf = new Map<string, LeveledNode>()
    const visit = (node: LeveledNode) => {
        for (const path of [node.path, ...(node.foldedPaths ?? [])]) {
            nodeAt.set(path, node)
        }
        for (const child of node.children) {
            parentOf.set(child.path, node)
            visit(child)
        }
    }
    visit(root)
    return { root, nodeAt, parentOf }
}

/** The box a folder is drawn as: its own, or the chain box it is folded into. */
export function boxPathOf({ nodeAt }: TreeIndex, containerPath: string): string | null {
    return nodeAt.get(containerPath)?.path ?? null
}

/** The boxes around a node or declaration, outermost first; null for one the tree does not hold. */
export function containerPathsOf(index: TreeIndex, path: string): string[] | null {
    const node = index.nodeAt.get(path)
    return node ? nodesAround(index, node).map(container => container.path) : null
}

/** The levels to walk down from the tree's root to reach a folder's box, outermost first. */
export function levelPathOf(index: TreeIndex, containerPath: string): number[] | null {
    const node = index.nodeAt.get(containerPath)
    if (!node) {
        return null
    }
    const [, ...belowTheRoot] = [...nodesAround(index, node), node]
    return belowTheRoot.map(below => below.level)
}

function nodesAround({ parentOf }: TreeIndex, node: LeveledNode): LeveledNode[] {
    const around: LeveledNode[] = []
    for (let parent = parentOf.get(node.path); parent; parent = parentOf.get(parent.path)) {
        around.unshift(parent)
    }
    return around
}
