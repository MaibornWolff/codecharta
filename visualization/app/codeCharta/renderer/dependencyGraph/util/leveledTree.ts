import { CodeMapNode, DependencyLeaf, DependencyLevelData, NodeType } from "../../../model/codeCharta.model"
import { declarationPathOf } from "./boxPaths"

/** The part of the file tree the dependency graph can place: files that carry a level, and the folders
 * holding them. A folder without a level of its own sits at level 0 of its parent. A chain of folders that
 * each hold just one folder is one box named by the whole chain, as in src/main/kotlin/de/…: nesting a box
 * per link would leave the files too small to read. The box keeps the deepest folder's path, and the folders
 * folded into it keep theirs in foldedPaths, outermost first. A file holds its declarations, which no level
 * of the file tree orders: they borrow the level they have within their package. */
export type BoxKind = "folder" | "package" | "file" | "declaration"

export interface LeveledNode {
    path: string
    name: string
    level: number
    kind: BoxKind
    children: LeveledNode[]
    foldedPaths?: string[]
    /** What a declaration is, as its language names it: class, interface, function, … */
    declarationKind?: string
}

export type LeavesByFile = Readonly<Record<string, Record<string, DependencyLeaf>>>

export const LEVEL_WHEN_ABSENT = 0
const NO_LEAVES: LeavesByFile = {}

export function buildLeveledTree(root: CodeMapNode, levels: DependencyLevelData, leaves: LeavesByFile = NO_LEAVES): LeveledNode | null {
    if (root.isExcluded || root.path === undefined) {
        return null
    }
    if (root.type !== NodeType.FOLDER) {
        return leveledFile(root, levels[root.path], leaves[root.path])
    }
    const children = (root.children ?? []).map(child => buildLeveledTree(child, levels, leaves)).filter(child => child !== null)
    if (children.length === 0) {
        return null
    }
    const level = levels[root.path] ?? LEVEL_WHEN_ABSENT
    const [onlyChild] = children
    if (children.length === 1 && onlyChild.kind === "folder") {
        return { ...onlyChild, name: `${root.name}/${onlyChild.name}`, level, foldedPaths: [root.path, ...(onlyChild.foldedPaths ?? [])] }
    }
    return { path: root.path, name: root.name, level, kind: "folder", children }
}

function leveledFile(file: CodeMapNode, level: number | undefined, leavesOfFile: Record<string, DependencyLeaf> = {}): LeveledNode | null {
    if (level === undefined) {
        return null
    }
    const declarations = Object.entries(leavesOfFile).map(([key, leaf]) => leveledDeclaration(declarationPathOf(file.path, key), leaf))
    return { path: file.path, name: file.name, level, kind: "file", children: declarations }
}

function leveledDeclaration(path: string, leaf: DependencyLeaf): LeveledNode {
    return { path, name: leaf.name, level: leaf.level ?? LEVEL_WHEN_ABSENT, kind: "declaration", children: [], declarationKind: leaf.kind }
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

/** The boxes around a node or declaration, outermost first; null for one the tree does not hold. */
export function containerPathsOf(tree: LeveledNode, path: string): string[] | null {
    if (tree.path === path || tree.foldedPaths?.includes(path)) {
        return []
    }
    for (const child of tree.children) {
        const containersBelow = containerPathsOf(child, path)
        if (containersBelow !== null) {
            return [tree.path, ...containersBelow]
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

/** Only the root is open, and the folders and packages below it for as long as each holds nothing but one of
 * them: a lone box would show nothing. */
const HOLDING_FILES: ReadonlySet<BoxKind> = new Set(["folder", "package"])

export function collapsedFirstLook(tree: LeveledNode): Set<string> {
    const opened = new Set<string>([tree.path])
    let folder = tree
    while (folder.children.length === 1 && HOLDING_FILES.has(folder.children[0].kind)) {
        folder = folder.children[0]
        opened.add(folder.path)
    }
    return opened
}
