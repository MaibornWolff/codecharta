import { createSelector } from "@ngrx/store"
import { MarkedPackage } from "../../../../../codeCharta.model"
import { mapColorsSelector } from "../../../../store/appSettings/mapColors/mapColors.selector"
import { markedPackagesSelector } from "../../../../store/fileSettings/markedPackages/markedPackages.selector"
import { findIndexOfMarkedPackageOrParent } from "../../../../store/fileSettings/markedPackages/util/findIndexOfMarkedPackageOrParent"
import { rightClickedCodeMapNodeSelector } from "../../rightClickedCodeMapNode.selector"

export type MarkFolderItem = {
    color: string
    isMarked: boolean
}

const markingColorsSelector = createSelector(mapColorsSelector, mapColors => mapColors.markingColors)

export const _getMarkFolderItems = (node: { path?: string } | null, markingColors: string[], markedPackages: MarkedPackage[]) => {
    // some browsers (e.g. arc v. 1.94.0) set markingColors as an object (not string[]) due to a bug, so we need to manually adjust this
    if (!Array.isArray(markingColors)) {
        markingColors = Object.values(markingColors)
    }
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
