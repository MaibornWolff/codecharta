import { CodeMapNode, DependencyLevelData, NodeType } from "../../../model/codeCharta.model"

/** The part of the file tree the dependency graph can place: files that carry a level, and the folders
 * holding them. A folder without a level of its own sits at level 0 of its parent. */
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
    return { path: root.path, name: root.name, level: levels[root.path] ?? FOLDER_LEVEL_WHEN_ABSENT, isFolder: true, children }
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
