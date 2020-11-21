import { MarkedPackagesAction, MarkedPackagesActions, setMarkedPackages } from "./markedPackages.actions"
import { removeEntryAtIndexFromArray } from "../../../../util/reduxHelper"

export function markedPackages(state = setMarkedPackages().payload, action: MarkedPackagesAction) {
	switch (action.type) {
		case MarkedPackagesActions.SET_MARKED_PACKAGES:
			return action.payload
		case MarkedPackagesActions.UNMARK_PACKAGE:
			return removeEntryAtIndexFromArray(state, action.payload)
		default:
			return state
	}
}
