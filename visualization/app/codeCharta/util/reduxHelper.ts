import _ from "lodash"
import angular from "angular"

export function removeItemFromArray(array: any[], item: any): any[] {
	return array.filter(x => {
		return !isEqualObject(x, item)
	})
}

export function addItemToArray(array: any[], item: any): any[] {
	if (!arrayContainsItem(array, item)) {
		const copy = [...array]
		copy.push(_.cloneDeep(item))
		return copy
	}
	return array
}

function arrayContainsItem(array: any[], item: any): boolean {
	return !!array.find(x => isEqualObject(x, item))
}

function isEqualObject(obj1: any, obj2: any): boolean {
	return angular.toJson(obj1) === angular.toJson(obj2)
}
