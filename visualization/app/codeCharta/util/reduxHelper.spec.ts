import { addItemToArray, removeItemFromArray } from "./reduxHelper"

describe("reduxHelper", () => {
	let obj1: { x: number; y: number }
	let obj2: { x: number; y: number }
	let arr: { x: number; y: number }[]

	beforeEach(() => {
		obj1 = { x: 1, y: 2 }
		obj2 = { x: 3, y: 4 }
		arr = []
	})

	function mutateObject(obj: any) {
		obj.x = 10000
	}

	describe("removeItemFromArray", () => {
		it("should deepClone an array and remove the item", () => {
			arr.push(obj1)
			arr.push(obj2)

			const result = removeItemFromArray(arr, obj1)
			mutateObject(obj1)

			expect(result).toEqual([{ x: 3, y: 4 }])
		})
	})

	describe("addItemToArray", () => {
		it("should shallow copy an array and push a cloned item to it", () => {
			arr.push(obj1)

			const result = addItemToArray(arr, obj2)
			mutateObject(obj1)
			mutateObject(obj2)

			expect(result).toEqual([{ x: 10000, y: 2 }, { x: 3, y: 4 }])
		})
	})
})
