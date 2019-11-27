import _ from "lodash"

export function removeItemFromArray(array: any[], item: any): any[] {
	return _.cloneDeep(array).filter(x => {
		return JSON.stringify(x) !== JSON.stringify(item)
	})
}
