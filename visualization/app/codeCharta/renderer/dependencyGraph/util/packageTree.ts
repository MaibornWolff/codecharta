import { DependencyLeaf, DependencyNamespace } from "../../../model/codeCharta.model"
import { packageKeyOf, packagePathOf } from "./boxPaths"
import { LeavesByFile, LeveledNode } from "./leveledTree"

export type Namespaces = Readonly<Record<string, DependencyNamespace>>

export interface PackagePlacement {
    packageKey: string
    /** The file's level among what its package holds. */
    level: number
}

const NAMESPACE_SEPARATOR = "."
const LEVEL_WHEN_ABSENT = 0

/** A file goes where most of its declarations are declared, the first package by name among equals, and as
 * high there as the highest of them: a file has no level of its own among packages. A file declaring no package
 * the map knows has no place among them. */
export function packagePlacementOf(
    leavesOfFile: Readonly<Record<string, DependencyLeaf>> | undefined,
    namespaces: Namespaces
): PackagePlacement | null {
    const levelsByPackage = new Map<string, number[]>()
    for (const { namespace, level = LEVEL_WHEN_ABSENT } of Object.values(leavesOfFile ?? {})) {
        if (namespace !== undefined && namespaces[namespace] !== undefined) {
            levelsByPackage.set(namespace, [...(levelsByPackage.get(namespace) ?? []), level])
        }
    }
    const [mostDeclared] = [...levelsByPackage].sort(
        ([keyA, levelsA], [keyB, levelsB]) => levelsB.length - levelsA.length || keyA.localeCompare(keyB)
    )
    return mostDeclared ? { packageKey: mostDeclared[0], level: Math.max(...mostDeclared[1]) } : null
}

/** The same files nested in the packages their declarations declare. A file without a package stays in its
 * folder, beside the packages: both kinds of box then share the root, with levels that do not compare. A chain
 * of packages that each hold just one package is one box, as a chain of folders is. */
export function arrangedByPackages(tree: LeveledNode, namespaces: Namespaces, leaves: LeavesByFile): LeveledNode {
    if (tree.kind !== "folder") {
        return tree
    }
    const filesByPackage = new Map<string, LeveledNode[]>()
    const place = (file: LeveledNode): boolean => {
        const placement = packagePlacementOf(leaves[file.path], namespaces)
        if (placement) {
            filesByPackage.set(placement.packageKey, [
                ...(filesByPackage.get(placement.packageKey) ?? []),
                { ...file, level: placement.level }
            ])
        }
        return placement !== null
    }
    const leftInFolders = tree.children.flatMap(child => withoutPlacedFiles(child, place))
    return { ...tree, children: [...new PackageNodes(namespaces, filesByPackage).topLevel(), ...leftInFolders] }
}

function withoutPlacedFiles(node: LeveledNode, place: (file: LeveledNode) => boolean): LeveledNode[] {
    if (node.kind === "file") {
        return place(node) ? [] : [node]
    }
    const children = node.children.flatMap(child => withoutPlacedFiles(child, place))
    return children.length === 0 ? [] : [{ ...node, children }]
}

class PackageNodes {
    private readonly keysByParent = new Map<string | null, string[]>()

    constructor(
        private readonly namespaces: Namespaces,
        private readonly filesByPackage: ReadonlyMap<string, LeveledNode[]>
    ) {
        for (const key of Object.keys(namespaces)) {
            const parentKey = this.parentOf(key)
            this.keysByParent.set(parentKey, [...(this.keysByParent.get(parentKey) ?? []), key])
        }
    }

    topLevel(): LeveledNode[] {
        return this.below(null)
    }

    /** A package whose parent the map does not know is a top-level one, and so is one that is its own
     * parent some packages up: left there, neither it nor its files would be reached from the top. */
    private parentOf(key: string): string | null {
        const parentKey = this.namespaces[key].parent
        if (parentKey === undefined || this.namespaces[parentKey] === undefined) {
            return null
        }
        const walked = new Set<string>()
        for (let above: string | undefined = parentKey; above !== undefined && !walked.has(above); above = this.namespaces[above]?.parent) {
            if (above === key) {
                return null
            }
            walked.add(above)
        }
        return parentKey
    }

    private below(parentKey: string | null): LeveledNode[] {
        return (this.keysByParent.get(parentKey) ?? []).flatMap(key => this.nodeOf(key, parentKey))
    }

    private nodeOf(key: string, outerKey: string | null): LeveledNode[] {
        const files = this.filesByPackage.get(key) ?? []
        const path = packagePathOf(key)
        const level = this.namespaces[key].level
        const packages = this.below(key)
        const [onlyPackage] = packages
        if (files.length === 0 && packages.length === 1) {
            const name = nameWithin(packageKeyOf(onlyPackage.path), outerKey)
            return [{ ...onlyPackage, name, level, foldedPaths: [path, ...(onlyPackage.foldedPaths ?? [])] }]
        }
        const children = [...packages, ...files]
        return children.length === 0 ? [] : [{ path, name: nameWithin(key, outerKey), level, kind: "package", children }]
    }
}

/** A package inside another is named by what its name adds to the other's, as a folder is by its last segment. */
function nameWithin(key: string, outerKey: string | null): string {
    const outerPrefix = `${outerKey}${NAMESPACE_SEPARATOR}`
    return outerKey !== null && key.startsWith(outerPrefix) ? key.slice(outerPrefix.length) : key
}
