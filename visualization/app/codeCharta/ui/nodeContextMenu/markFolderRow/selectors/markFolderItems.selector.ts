import { createSelector } from "../../../../state/angular-redux/createSelector"
import { mapColorsSelector } from "../../../../state/store/appSettings/mapColors/mapColors.selector"
import { markedPackagesSelector } from "../../../../state/store/fileSettings/markedPackages/markedPackages.selector"
import { findIndexOfMarkedPackageOrParent } from "../../../../state/store/fileSettings/markedPackages/util/findIndexOfMarkedPackageOrParent"
import { CcState } from "../../../../state/store/store"
import { rightClickedNodeSelector } from "./rightClickedNode.selector"

export type MarkFolderItem = {
	color: string
	isMarked: boolean
}

const markingColorsSelector = createSelector([mapColorsSelector], mapColors => mapColors.markingColors)

export const markFolderItemsSelector: (state: CcState) => MarkFolderItem[] = createSelector(
	[rightClickedNodeSelector, markingColorsSelector, markedPackagesSelector],
	(node, markingColors, markedPackages) => {
		if (node === null) return markingColors.map(color => ({ color, isMarked: false }))

		const nodeIndexWithinMarkedPackages = findIndexOfMarkedPackageOrParent(markedPackages, node.path)
		return markingColors.map(color => ({
			color,
			isMarked: nodeIndexWithinMarkedPackages !== -1 && color === markedPackages[nodeIndexWithinMarkedPackages].color
		}))
	}
)
