import { createSelector } from "@ngrx/store"
import { ExplorerCounts } from "../../../features/sidebarExplorer/facade"
import { CodeMapNode } from "../../../model/codeCharta.model"
import { codeMapNodesSelector, searchedNodesSelector } from "../../../renderer/renderModel/renderModel.facade"
import { areaMetricSelector } from "../../../stores/mapState/mapState.read.facade"
import { isAreaValid, isLeaf } from "../../../util/codeMapHelper"

export const _calculateExplorerCounts = (searchedNodes: CodeMapNode[], allLeaves: CodeMapNode[], areaMetric: string): ExplorerCounts => {
    const matchingLeaves = searchedNodes.length > 0 ? searchedNodes.filter(node => isLeaf(node)) : allLeaves
    let flattened = 0
    let hidden = 0
    let shown = 0
    let noArea = 0
    for (const leaf of matchingLeaves) {
        if (leaf.isFlattened) {
            flattened++
        }
        if (leaf.isExcluded) {
            hidden++
        }
        if (!leaf.isFlattened && !leaf.isExcluded) {
            shown++
            if (!isAreaValid(leaf, areaMetric)) {
                noArea++
            }
        }
    }
    return { shown, flattened, hidden, noArea }
}

export const explorerCountsSelector = createSelector(
    searchedNodesSelector,
    codeMapNodesSelector,
    areaMetricSelector,
    _calculateExplorerCounts
)
