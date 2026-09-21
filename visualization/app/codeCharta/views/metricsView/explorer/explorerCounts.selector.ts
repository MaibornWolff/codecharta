import { createSelector } from "@ngrx/store"
import { ExplorerCounts } from "../../../features/sidebarExplorer/facade"
import { CodeMapNode } from "../../../model/codeCharta.model"
import {
    codeMapNodesSelector,
    type FlattenPredicate,
    flattenPredicateSelector,
    searchedNodesSelector
} from "../../../renderer/renderModel/renderModel.facade"
import { areaMetricSelector } from "../../../stores/mapState/mapState.read.facade"
import { isAreaValid, isLeaf } from "../../../util/codeMapHelper"

export const _calculateExplorerCounts = (
    searchedNodes: CodeMapNode[],
    allLeaves: CodeMapNode[],
    areaMetric: string,
    isFlattened: FlattenPredicate
): ExplorerCounts => {
    const matchingLeaves = searchedNodes.length > 0 ? searchedNodes.filter(node => isLeaf(node)) : allLeaves
    let flattened = 0
    let excluded = 0
    let shown = 0
    let noArea = 0
    for (const leaf of matchingLeaves) {
        if (isFlattened(leaf)) {
            flattened++
        }
        if (leaf.isExcluded) {
            excluded++
        }
        if (!isFlattened(leaf) && !leaf.isExcluded) {
            shown++
            if (!isAreaValid(leaf, areaMetric)) {
                noArea++
            }
        }
    }
    return { shown, flattened, excluded, noArea }
}

export const explorerCountsSelector = createSelector(
    searchedNodesSelector,
    codeMapNodesSelector,
    areaMetricSelector,
    flattenPredicateSelector,
    _calculateExplorerCounts
)
