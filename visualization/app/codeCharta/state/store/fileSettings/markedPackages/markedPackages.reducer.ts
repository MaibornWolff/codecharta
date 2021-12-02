import { MarkedPackagesAction, MarkedPackagesActions, setMarkedPackages } from "./markedPackages.actions"
import { removeEntryAtIndexFromArray } from "../../../../util/reduxHelper"
import { addMarkedPackage } from "./util/addMarkedPackage"

export function markedPackages(state = setMarkedPackages().payload, action: MarkedPackagesAction) {
	switch (action.type) {
		case MarkedPackagesActions.SET_MARKED_PACKAGES:
			return action.payload
		case MarkedPackagesActions.UNMARK_PACKAGE:
			return removeEntryAtIndexFromArray(state, action.payload)
		case MarkedPackagesActions.CALCULATE_MARKED_PACKAGES_FOR_PATHS: {
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
