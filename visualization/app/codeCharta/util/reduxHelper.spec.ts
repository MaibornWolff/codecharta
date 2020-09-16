import { addItemToArray, isActionOfType, removeItemFromArray } from "./reduxHelper"
import { ScalingActions } from "../state/store/appSettings/scaling/scaling.actions"
import { IsLoadingFileActions } from "../state/store/appSettings/isLoadingFile/isLoadingFile.actions"

function mutateObject(object: Record<string, number>) {
	object.x = 10000
}

describe("reduxHelper", () => {
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
			array.push(object1)
			array.push(object2)

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
				{ x: 10000, y: 2 },
				{ x: 3, y: 4 }
			])
		})
	})

	describe("isActionOfType", () => {
		it("should return true if an action is part of an enum", () => {
			const result = isActionOfType(ScalingActions.SET_SCALING, ScalingActions)

			expect(result).toBeTruthy()
		})

		it("should return false if an action is not part of an enum", () => {
			const result = isActionOfType(IsLoadingFileActions.SET_IS_LOADING_FILE, ScalingActions)

			expect(result).toBeFalsy()
		})
	})
})
