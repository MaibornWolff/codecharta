import { addItemToArray, isActionOfType, removeItemFromArray } from "./reduxHelper"
import { ScalingActions } from "../state/store/appSettings/scaling/scaling.actions"
import { IsLoadingFileActions } from "../state/store/appSettings/isLoadingFile/isLoadingFile.actions"

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
