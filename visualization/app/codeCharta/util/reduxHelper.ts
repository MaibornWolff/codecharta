import { clone } from "./clone"
import _ from "lodash"

export function removeItemFromArray<T>(array: T[], item: T) {
	return array.filter(x => {
		return !_.isEqual(x, item)
	})
}

export function addItemToArray<T>(array: T[], item: T) {
	if (!arrayContainsItem(array, item)) {
		return [...array, clone(item)]
	}
	return array
}

export function isActionOfType(actionType: string, actions) {
	return actions[actionType] !== undefined
}

function arrayContainsItem<T>(array: T[], item: T) {
	return array.some(x => _.isEqual(x, item))
}
