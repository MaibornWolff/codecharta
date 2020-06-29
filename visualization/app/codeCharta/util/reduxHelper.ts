import _ from "lodash"

const clone = require("rfdc")()

export function removeItemFromArray(array: any[], item: any): any[] {
	return array.filter(x => {
		return !_.isEqual(x, item)
	})
}

export function addItemToArray(array: any[], item: any): any[] {
	if (!arrayContainsItem(array, item)) {
		const copy = [...array]
		copy.push(clone(item))
		return copy
	}
	return array
}

export function isActionOfType(actionType: string, actions) {
	return actions[actionType] !== undefined
}

function arrayContainsItem(array: any[], item: any): boolean {
	return array.some(x => _.isEqual(x, item))
}
