import { clone } from "./clone"
import _ from "lodash"

export function removeItemFromArray(array: any[], item: any): any[] {
	return array.filter(x => {
		return !_.isEqual(x, item)
	})
}

export function addItemToArray(array: any[], item: any): any[] {
	if (!arrayContainsItem(array, item)) {
		return [...array, clone(item)]
	}
	return array
}

export function isActionOfType(actionType: string, actions) {
	return actions[actionType] !== undefined
}

function arrayContainsItem(array: any[], item: any): boolean {
	return array.some(x => _.isEqual(x, item))
}
