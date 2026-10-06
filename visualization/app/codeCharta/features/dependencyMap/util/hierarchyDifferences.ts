import { DependencyDeclarations, dependencyEdgeTypeOf } from "../../../lenses/dependency/dependencyLens.facade"
import { DependencyLeafEdge, Edge } from "../../../model/codeCharta.model"
import { LeveledNode, packagePlacementOf } from "../../../renderer/dependencyGraph/dependencyGraph.facade"

/** What the two hierarchies of a map disagree about. Where the packages mirror the folders, nothing. */
export interface HierarchyDifferences {
    /** Files lying apart from most files of their package, or among the files of another package. */
    files: ReadonlySet<string>
    /** Folders standing on another level than the package most of their files declare. */
    folders: ReadonlySet<string>
    /** Packages, by their key, standing on another level than the folder most of their files lie in. */
    packages: ReadonlySet<string>
    /** Pairs of files, as from|to, whose edge is of another type among the folders than among the packages. */
    filePairs: ReadonlySet<string>
}

export const NO_HIERARCHY_DIFFERENCES: HierarchyDifferences = {
    files: new Set(),
    folders: new Set(),
    packages: new Set(),
    filePairs: new Set()
}

interface PlacedFile {
    path: string
    folderPath: string
    packageKey: string | null
}

export function filePairOf(fromFilePath: string, toFilePath: string): string {
    return `${fromFilePath}|${toFilePath}`
}

export function findHierarchyDifferences(
    folderTree: LeveledNode,
    { namespaces, leaves, leafEdges }: DependencyDeclarations,
    fileEdges: readonly Edge[]
): HierarchyDifferences {
    const folderLevels = new Map<string, number>()
    const files = placedFilesIn(folderTree, folderLevels, filePath => packagePlacementOf(leaves[filePath], namespaces)?.packageKey ?? null)
    const homeFolderOf = mostFrequent(
        files,
        file => file.packageKey,
        file => file.folderPath
    )
    const homePackageOf = mostFrequent(
        files,
        file => file.folderPath,
        file => file.packageKey
    )
    const mirrored = [...homeFolderOf].filter(([packageKey, folderPath]) => homePackageOf.get(folderPath) === packageKey)
    const onAnotherLevel = mirrored.filter(([packageKey, folderPath]) => namespaces[packageKey].level !== folderLevels.get(folderPath))
    return {
        files: new Set(files.filter(file => liesApart(file, homeFolderOf, homePackageOf)).map(file => file.path)),
        folders: new Set(onAnotherLevel.map(([, folderPath]) => folderPath)),
        packages: new Set(onAnotherLevel.map(([packageKey]) => packageKey)),
        filePairs: filePairsOfAnotherType(fileEdges, leafEdges)
    }
}

function placedFilesIn(
    folder: LeveledNode,
    folderLevels: Map<string, number>,
    packageOf: (filePath: string) => string | null
): PlacedFile[] {
    folderLevels.set(folder.path, folder.level)
    return folder.children.flatMap(child =>
        child.kind === "file"
            ? [{ path: child.path, folderPath: folder.path, packageKey: packageOf(child.path) }]
            : placedFilesIn(child, folderLevels, packageOf)
    )
}

/** For each group of files, the value most of them share, the first by name among equals. */
function mostFrequent(
    files: readonly PlacedFile[],
    groupOf: (file: PlacedFile) => string | null,
    sharedOf: (file: PlacedFile) => string | null
): Map<string, string> {
    const counts = new Map<string, Map<string, number>>()
    for (const file of files) {
        const group = groupOf(file)
        const value = sharedOf(file)
        if (group !== null && value !== null) {
            const countsOfGroup = counts.get(group) ?? new Map<string, number>()
            counts.set(group, countsOfGroup.set(value, (countsOfGroup.get(value) ?? 0) + 1))
        }
    }
    const first = ([valueA, countA]: [string, number], [valueB, countB]: [string, number]) =>
        countB - countA || valueA.localeCompare(valueB)
    return new Map([...counts].map(([group, countsOfGroup]) => [group, [...countsOfGroup].sort(first)[0][0]]))
}

/** A file without a package lies apart once most files beside it declare one. */
function liesApart(
    { folderPath, packageKey }: PlacedFile,
    homeFolderOf: ReadonlyMap<string, string>,
    homePackageOf: ReadonlyMap<string, string>
): boolean {
    const packageOfFolder = homePackageOf.get(folderPath)
    if (packageKey === null) {
        return packageOfFolder !== undefined
    }
    return homeFolderOf.get(packageKey) !== folderPath || packageOfFolder !== packageKey
}

function filePairsOfAnotherType(fileEdges: readonly Edge[], leafEdges: readonly DependencyLeafEdge[]): Set<string> {
    const flagsAmongPackages = new Map<string, { isCyclic: boolean; isPointingUpwards: boolean }>()
    for (const leafEdge of leafEdges) {
        const pair = filePairOf(leafEdge.fromNodeName, leafEdge.toNodeName)
        const flags = flagsAmongPackages.get(pair) ?? { isCyclic: false, isPointingUpwards: false }
        flagsAmongPackages.set(pair, {
            isCyclic: flags.isCyclic || Boolean(leafEdge.isCyclic),
            isPointingUpwards: flags.isPointingUpwards || Boolean(leafEdge.isPointingUpwards)
        })
    }
    const pairs = new Set<string>()
    for (const edge of fileEdges) {
        const pair = filePairOf(edge.fromNodeName, edge.toNodeName)
        const amongPackages = flagsAmongPackages.get(pair)
        if (amongPackages && dependencyEdgeTypeOf(amongPackages) !== dependencyEdgeTypeOf(edge)) {
            pairs.add(pair)
        }
    }
    return pairs
}
