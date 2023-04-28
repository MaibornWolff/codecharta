import { addItemToArray, removeItemFromArray } from "./arrayHelper"

function mutateObject(object: Record<string, number>) {
	object.x = 10_000
}

describe("arrayHelper", () => {
	let object1: { x: number; y: number }
	let object2: { x: number; y: number }
	let array: { x: number; y: number }[]

	beforeEach(() => {
		object1 = { x: 1, y: 2 }
		object2 = { x: 3, y: 4 }
		array = []
	})

	describe("removeItemFromArray", () => {
		it("should deepClone an array and remove the item", () => {
			array.push(object1, object2)

			const result = removeItemFromArray(array, object1)
			mutateObject(object1)

			expect(result).toEqual([{ x: 3, y: 4 }])
		})
	})

	describe("addItemToArray", () => {
		it("should shallow copy an array and push a cloned item to it", () => {
			array.push(object1)

			const result = addItemToArray(array, object2)
			mutateObject(object1)
			mutateObject(object2)

			expect(result).toEqual([
				{ x: 10_000, y: 2 },
				{ x: 3, y: 4 }
			])
		})
	})
})
