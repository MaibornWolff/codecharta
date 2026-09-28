import { CodeMapNode, DependencyLevelData, NodeType } from "../../../model/codeCharta.model"

/** The part of the file tree the dependency graph can place: files that carry a level, and the folders
 * holding them. A folder without a level of its own sits at level 0 of its parent. A chain of folders that
 * each hold just one folder is one box named by the whole chain, as in src/main/kotlin/de/…: nesting a box
 * per link would leave the files too small to read. The box keeps the deepest folder's path. */
export interface LeveledNode {
    path: string
    name: string
    level: number
    isFolder: boolean
    children: LeveledNode[]
}

const FOLDER_LEVEL_WHEN_ABSENT = 0

export function buildLeveledTree(root: CodeMapNode, levels: DependencyLevelData): LeveledNode | null {
    if (root.isExcluded || root.path === undefined) {
        return null
    }
    if (root.type !== NodeType.FOLDER) {
        const level = levels[root.path]
        return level === undefined ? null : { path: root.path, name: root.name, level, isFolder: false, children: [] }
    }
    const children = (root.children ?? []).map(child => buildLeveledTree(child, levels)).filter(child => child !== null)
    if (children.length === 0) {
        return null
    }
    const level = levels[root.path] ?? FOLDER_LEVEL_WHEN_ABSENT
    const [onlyChild] = children
    if (children.length === 1 && onlyChild.isFolder) {
        return { ...onlyChild, name: `${root.name}/${onlyChild.name}`, level }
    }
    return { path: root.path, name: root.name, level, isFolder: true, children }
}

/** Leaves the hidden nodes out, and with them every folder that held nothing else. */
export function withoutHidden(tree: LeveledNode, hiddenPaths: ReadonlySet<string>): LeveledNode | null {
    if (hiddenPaths.has(tree.path)) {
        return null
    }
    if (!tree.isFolder || hiddenPaths.size === 0) {
        return tree
    }
    const children = tree.children.map(child => withoutHidden(child, hiddenPaths)).filter(child => child !== null)
    return children.length === 0 ? null : { ...tree, children }
}

/** Opens folders breadth first, as long as the boxes on screen stay within the budget, so a first look
 * shows as much structure as fits. A folder with a single child costs nothing to open. */
export function expandWithinBudget(tree: LeveledNode, budget: number): Set<string> {
    const expanded = new Set<string>([tree.path])
    let visibleCount = tree.children.length
    const candidates = tree.children.filter(child => child.isFolder)
    while (candidates.length > 0) {
        const folder = candidates.shift()
        const additionalBoxes = folder.children.length - 1
        if (visibleCount + additionalBoxes > budget) {
            continue
        }
        expanded.add(folder.path)
        visibleCount += additionalBoxes
        candidates.push(...folder.children.filter(child => child.isFolder))
    }
    return expanded
}
