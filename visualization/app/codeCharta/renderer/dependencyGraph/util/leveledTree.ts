import { CodeMapNode, DependencyLevelData, NodeType } from "../../../model/codeCharta.model"

/** The part of the file tree the dependency graph can place: files that carry a level, and the folders
 * holding them. A folder without a level of its own sits at level 0 of its parent. A chain of folders that
 * each hold just one folder is one box named by the whole chain, as in src/main/kotlin/de/…: nesting a box
 * per link would leave the files too small to read. The box keeps the deepest folder's path, and the folders
 * folded into it keep theirs in foldedPaths, outermost first. */
export interface LeveledNode {
    path: string
    name: string
    level: number
    isFolder: boolean
    children: LeveledNode[]
    foldedPaths?: string[]
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
        return { ...onlyChild, name: `${root.name}/${onlyChild.name}`, level, foldedPaths: [root.path, ...(onlyChild.foldedPaths ?? [])] }
    }
    return { path: root.path, name: root.name, level, isFolder: true, children }
}

/** The box a folder is drawn as: its own, or the chain box it is folded into. */
export function boxPathOf(tree: LeveledNode, folderPath: string): string | null {
    if (tree.path === folderPath || tree.foldedPaths?.includes(folderPath)) {
        return tree.path
    }
    for (const child of tree.children) {
        const boxPath = boxPathOf(child, folderPath)
        if (boxPath !== null) {
            return boxPath
        }
    }
    return null
}

/** The levels to walk down from the tree's root to reach a folder's box, outermost first. */
export function levelPathOf(tree: LeveledNode, folderPath: string): number[] | null {
    if (tree.path === folderPath || tree.foldedPaths?.includes(folderPath)) {
        return []
    }
    for (const child of tree.children) {
        const levelPathBelowChild = levelPathOf(child, folderPath)
        if (levelPathBelowChild !== null) {
            return [child.level, ...levelPathBelowChild]
        }
    }
    return null
}

/** Only the root is open, and the folders below it for as long as each holds nothing but one folder: a lone box
 * would show nothing. */
export function collapsedFirstLook(tree: LeveledNode): Set<string> {
    const opened = new Set<string>([tree.path])
    let folder = tree
    while (folder.children.length === 1 && folder.children[0].isFolder) {
        folder = folder.children[0]
        opened.add(folder.path)
    }
    return opened
}
