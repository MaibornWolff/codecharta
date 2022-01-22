import { clone } from "./clone"
import isEqual from "lodash.isequal"
import { Action } from "redux"

export function removeItemFromArray<T>(array: T[], searchItem: T) {
	return array.filter(entry => !isEqual(entry, searchItem))
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

export function isActionOfType(actionType: string, actions) {
	return actions[actionType] !== undefined
}

export function isAction<T extends Action>(action: Action, actions: Record<string, string>): action is T {
	return actions[action.type] !== undefined
}

function arrayContainsItem<T>(array: T[], item: T) {
	return array.some(x => isEqual(x, item))
}
