import { createSelector } from "@ngrx/store"
import { klona } from "klona"
import { SortingOption } from "../../../model/codeCharta.model"
import { accumulatedDataSelector, pathToNodeSelector } from "../../../renderer/renderModel/renderModel.facade"
import { areaMetricSelector } from "../../../stores/mapState/mapState.read.facade"
import { currentFocusedNodePathSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { sortNodesInPlace } from "../../sidebarExplorer/facade"

// Under a focus the explorer lists the focused folder alone, so nothing the view leaves out can be picked.
const mapExplorerRootSelector = createSelector(
    accumulatedDataSelector,
    pathToNodeSelector,
    currentFocusedNodePathSelector,
    ({ unifiedMapNode }, pathToNode, focusedNodePath) => (focusedNodePath && pathToNode.get(focusedNodePath)) || unifiedMapNode
)

// Only area sorting reads the area metric; the other orders must not rebuild the tree when the metrics view picks another metric.
export const createMapExplorerTreeSelector = (sortingOrder: SortingOption, sortingOrderAscending: boolean) => {
    if (sortingOrder !== SortingOption.AREA_SIZE) {
        return createSelector(mapExplorerRootSelector, root => sortNodesInPlace(klona(root), sortingOrder, sortingOrderAscending))
    }
    return createSelector(mapExplorerRootSelector, areaMetricSelector, (root, areaMetric) =>
        sortNodesInPlace(klona(root), sortingOrder, sortingOrderAscending, areaMetric)
    )
}
