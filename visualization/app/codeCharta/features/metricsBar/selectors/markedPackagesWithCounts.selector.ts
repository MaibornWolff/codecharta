import { createSelector } from "@ngrx/store"
import { CodeMapNode, MarkedPackage } from "../../../codeCharta.model"
import { codeMapNodesSelector } from "../../../state/selectors/accumulatedData/codeMapNodes.selector"
import { markedPackagesSelector } from "../../../state/store/fileSettings/markedPackages/markedPackages.selector"
import { isLeaf } from "../../../util/codeMapHelper"

export type MarkedPackageWithCount = MarkedPackage & { fileCount: number }

export const _calculateMarkedPackagesWithCounts = (markedPackages: MarkedPackage[], nodes: CodeMapNode[]): MarkedPackageWithCount[] => {
    const fileCounts = new Map<string, number>(markedPackages.map(markedPackage => [markedPackage.path, 0]))

    for (const node of nodes) {
        if (!isLeaf(node) || node.isExcluded) {
            continue
        }
        const owningPackagePath = findClosestMarkedAncestorPath(fileCounts, node.path)
        if (owningPackagePath !== undefined) {
            fileCounts.set(owningPackagePath, fileCounts.get(owningPackagePath) + 1)
        }
    }

    return markedPackages
        .map(markedPackage => ({ ...markedPackage, fileCount: fileCounts.get(markedPackage.path) }))
        .sort((a, b) => a.path.localeCompare(b.path))
}

// walking the path upwards finds the deepest marked package first — nested packages
// tint their own floor (see getMarkingColor), so a file only counts toward that one
function findClosestMarkedAncestorPath(markedPackagePaths: ReadonlyMap<string, number>, nodePath: string) {
    let currentPath = nodePath
    while (currentPath) {
        if (markedPackagePaths.has(currentPath)) {
            return currentPath
        }
        const parentEndIndex = currentPath.lastIndexOf("/")
        currentPath = parentEndIndex > 0 ? currentPath.slice(0, parentEndIndex) : ""
    }
    return undefined
}

export const markedPackagesWithCountsSelector = createSelector(
    markedPackagesSelector,
    codeMapNodesSelector,
    _calculateMarkedPackagesWithCounts
)
