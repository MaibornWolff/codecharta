import _ from "lodash"

export function removeItemFromArray(array: any[], item: any): any[] {
	return _.cloneDeep(array).filter(x => {
		return JSON.stringify(x) !== JSON.stringify(item)
	})
}

export function addItemToArray(array: any[], item: any): any[] {
	const copy = _.cloneDeep(array)
	copy.push(_.cloneDeep(item))

	return copy
}
