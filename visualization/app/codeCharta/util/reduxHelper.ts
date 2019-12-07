import _ from "lodash"

export function removeItemFromArray(array: any[], item: any): any[] {
	return _.cloneDeep(array).filter(x => {
		return !isEqualObject(x, item)
	})
}

export function addItemToArray(array: any[], item: any): any[] {
	if (!arrayContainsItem(array, item)) {
		const copy = _.cloneDeep(array)
		copy.push(_.cloneDeep(item))
		return copy
	}
	return array
}

function arrayContainsItem(array: any[], item: any): boolean {
	return !!array.find(x => isEqualObject(x, item))
}

function isEqualObject(obj1: any, obj2: any): boolean {
	return JSON.stringify(obj1) === JSON.stringify(obj2)
}
