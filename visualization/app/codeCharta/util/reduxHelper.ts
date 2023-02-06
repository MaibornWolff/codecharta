import { clone } from "./clone"
import { dequal } from "dequal"
import { Action } from "redux"

export function removeItemFromArray<T>(array: T[], searchItem: T) {
	return array.filter(entry => !dequal(entry, searchItem))
}

export function removeEntryAtIndexFromArray<T>(array: T[], index: number) {
	return [...array.slice(0, index), ...array.slice(index + 1)]
}

export function addItemToArray<T>(array: T[], item: T) {
	if (!arrayContainsItem(array, item)) {
		return [...array, clone(item)]
	}
	return array
}

export function addItemsToArray<T>(array: T[], items: T[]) {
	const newArray = [...array]
	for (const item of items) {
		if (!arrayContainsItem(newArray, item)) {
			newArray.push(item)
		}
	}
	return newArray
}

export function isActionOfType(actionType: string, actions) {
	return actions[actionType] !== undefined
}

export function isAction<T extends Action>(action: Action, type: string): action is T {
	return action.type === type
}

function arrayContainsItem<T>(array: T[], item: T) {
	return array.some(x => dequal(x, item))
}
