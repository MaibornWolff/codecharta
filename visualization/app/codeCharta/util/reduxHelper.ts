import { clone } from "./clone"
import isEqual from "lodash.isequal"

export function removeItemFromArray<T>(array: T[], searchItem: T) {
	return array.filter(entry => !isEqual(entry, searchItem))
}

export function addItemToArray<T>(array: T[], item: T) {
	if (!arrayContainsItem(array, item)) {
		// TODO: Check if the clone is actually necessary here. It is probably not necessary.
		return [...array, clone(item)]
	}
	return array
}

export function isActionOfType(actionType: string, actions) {
	return actions[actionType] !== undefined
}

function arrayContainsItem<T>(array: T[], item: T) {
	return array.some(x => isEqual(x, item))
}
