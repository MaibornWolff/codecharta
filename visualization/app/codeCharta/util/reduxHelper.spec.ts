import { removeItemFromArray } from "./reduxHelper"

describe("reduxHelper", () => {
	describe("removeItemFromArray", () => {
		it("should deepClone an array and remove the item", () => {
			const object1 = { x: 1, y: 2 }
			const object2 = { x: 3, y: 4 }
			const arr = [object1, object2]

			const result = removeItemFromArray(arr, object1)
			object2.x = 5
			object2.y = 6

			expect(result).toEqual([{ x: 3, y: 4 }])
			expect(result[0]).not.toEqual(object2)
		})
	})
})
