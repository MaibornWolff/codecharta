import { createSelector } from "@ngrx/store"
import { CodeMapNode, MarkedPackage } from "../../../codeCharta.model"
import { codeMapNodesSelector } from "../../../state/selectors/accumulatedData/codeMapNodes.selector"
import { markedPackagesSelector } from "../../../state/store/fileSettings/markedPackages/markedPackages.selector"
import { isLeaf } from "../../../util/codeMapHelper"

export type MarkedPackageWithCount = MarkedPackage & { fileCount: number }

export const _calculateMarkedPackagesWithCounts = (markedPackages: MarkedPackage[], nodes: CodeMapNode[]): MarkedPackageWithCount[] => {
    const fileCounts = new Map<string, number>(markedPackages.map(markedPackage => [markedPackage.path, 0]))

    for (const node of nodes) {
        if (!isLeaf(node)) {
            continue
        }
        const owningPackagePath = findDeepestMarkedPackagePath(markedPackages, node.path)
        if (owningPackagePath !== undefined) {
            fileCounts.set(owningPackagePath, fileCounts.get(owningPackagePath) + 1)
        }
    }

    return markedPackages
        .map(markedPackage => ({ ...markedPackage, fileCount: fileCounts.get(markedPackage.path) }))
        .sort((a, b) => a.path.localeCompare(b.path))
}

// a file inside nested marked packages is colored by the deepest one (see getMarkingColor),
// so it must only count toward that package
function findDeepestMarkedPackagePath(markedPackages: MarkedPackage[], nodePath: string) {
    let deepestPath: string | undefined
    for (const { path } of markedPackages) {
        if ((nodePath === path || nodePath.startsWith(`${path}/`)) && (deepestPath === undefined || path.length > deepestPath.length)) {
            deepestPath = path
        }
    }
    return deepestPath
}

export const markedPackagesWithCountsSelector = createSelector(
    markedPackagesSelector,
    codeMapNodesSelector,
    _calculateMarkedPackagesWithCounts
)
