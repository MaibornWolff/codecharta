import { Injectable, inject } from "@angular/core"
import { createSelector, Store } from "@ngrx/store"
import { ExplorerCounts, ExplorerCountsSource } from "../../../features/sidebarExplorer/facade"
import { pathsWithDependencyLevelsSelector } from "../../../lenses/dependency/dependencyLens.facade"
import { CcState, CodeMapNode } from "../../../model/codeCharta.model"
import { codeMapNodesSelector, searchedNodesSelector } from "../../../renderer/renderModel/renderModel.facade"
import { isLeaf } from "../../../util/codeMapHelper"

/** Shown are the files the graph has a box for; the graph ignores flattening, so nothing counts as flattened. */
export function countDependencyExplorer(
    searchedNodes: CodeMapNode[],
    allLeaves: CodeMapNode[],
    pathsWithDependencyLevels: ReadonlySet<string>
): ExplorerCounts {
    const matchingLeaves = searchedNodes.length > 0 ? searchedNodes.filter(node => isLeaf(node)) : allLeaves
    const excluded = matchingLeaves.filter(leaf => leaf.isExcluded).length
    const shown = matchingLeaves.filter(leaf => !leaf.isExcluded && pathsWithDependencyLevels.has(leaf.path)).length
    return { shown, flattened: 0, excluded, noArea: 0 }
}

const dependencyExplorerCountsSelector = createSelector(
    searchedNodesSelector,
    codeMapNodesSelector,
    pathsWithDependencyLevelsSelector,
    countDependencyExplorer
)

@Injectable()
export class DependencyExplorerCounts implements ExplorerCountsSource {
    readonly counts$ = inject<Store<CcState>>(Store).select(dependencyExplorerCountsSelector)
}
