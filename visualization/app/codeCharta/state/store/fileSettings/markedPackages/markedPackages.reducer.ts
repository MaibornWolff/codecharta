import { MarkedPackagesAction, MarkedPackagesActions, setMarkedPackages } from "./markedPackages.actions"
import { MarkedPackage } from "../../../../codeCharta.model"
import { addItemToArray, removeItemFromArray } from "../../../../util/reduxHelper"
const clone = require("rfdc")()

export function markedPackages(
	state: MarkedPackage[] = setMarkedPackages().payload,
	action: MarkedPackagesAction
): MarkedPackage[] {
	switch (action.type) {
		case MarkedPackagesActions.SET_MARKED_PACKAGES:
			return clone(action.payload)
		case MarkedPackagesActions.MARK_PACKAGE:
			return addItemToArray(state, action.payload)
		case MarkedPackagesActions.UNMARK_PACKAGE:
			return removeItemFromArray(state, action.payload)
		default:
			return state
	}
}
