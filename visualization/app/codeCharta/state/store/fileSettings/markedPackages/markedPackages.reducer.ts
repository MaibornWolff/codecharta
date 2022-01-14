import { MarkedPackagesAction, MarkedPackagesActions, setMarkedPackages } from "./markedPackages.actions"
import { removeEntryAtIndexFromArray } from "../../../../util/reduxHelper"
import { addMarkedPackage } from "./util/addMarkedPackage"
import { findIndexOfMarkedPackageOrParent } from "./util/findIndexOfMarkedPackageOrParent"

export function markedPackages(state = setMarkedPackages().payload, action: MarkedPackagesAction) {
	switch (action.type) {
		case MarkedPackagesActions.SET_MARKED_PACKAGES:
			return action.payload
		case MarkedPackagesActions.UNMARK_PACKAGE: {
			const indexOfPackageToBeUnmarked = findIndexOfMarkedPackageOrParent(state, action.payload)
			if (indexOfPackageToBeUnmarked !== -1) return removeEntryAtIndexFromArray(state, indexOfPackageToBeUnmarked)
			return state
		}
		case MarkedPackagesActions.MARK_PACKAGE: {
			const markedPackagesMap = new Map(state.map(entry => [entry.path, entry]))

			for (const markedPackage of action.payload) {
				addMarkedPackage(markedPackagesMap, markedPackage)
			}

			return [...markedPackagesMap.values()]
		}
		default:
			return state
	}
}
