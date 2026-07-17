import { createSelector } from "@ngrx/store"
import { MarkedPackage } from "../../../model/codeCharta.model"
import { rightClickedCodeMapNodeSelector } from "../../../renderer/renderModel/renderModel.facade"
import { mapColorsSelector } from "../../../stores/mapState/mapState.read.facade"
import { findIndexOfMarkedPackageOrParent, markedPackagesSelector } from "../../../stores/sharedView/sharedView.read.facade"

export type MarkFolderItem = {
    color: string
    isMarked: boolean
}

const markingColorsSelector = createSelector(mapColorsSelector, mapColors => mapColors.markingColors)

export const _getMarkFolderItems = (node: { path?: string } | null, markingColors: string[], markedPackages: MarkedPackage[]) => {
    if (node === null) {
        return markingColors.map(color => ({ color, isMarked: false }))
    }

    const nodeIndexWithinMarkedPackages = findIndexOfMarkedPackageOrParent(markedPackages, node.path)
    return markingColors.map(color => ({
        color,
        isMarked: nodeIndexWithinMarkedPackages !== -1 && color === markedPackages[nodeIndexWithinMarkedPackages].color
    }))
}

export const markFolderItemsSelector = createSelector(
    rightClickedCodeMapNodeSelector,
    markingColorsSelector,
    markedPackagesSelector,
    _getMarkFolderItems
)

export const _getCurrentMarkColor = (node: { path?: string } | null, markedPackages: MarkedPackage[]) => {
    if (node === null) {
        return null
    }
    const nodeIndexWithinMarkedPackages = findIndexOfMarkedPackageOrParent(markedPackages, node.path)
    return nodeIndexWithinMarkedPackages === -1 ? null : markedPackages[nodeIndexWithinMarkedPackages].color
}

export const currentMarkColorSelector = createSelector(rightClickedCodeMapNodeSelector, markedPackagesSelector, _getCurrentMarkColor)
