import { isLoadingMap } from "./isLoadingMap.reducer"
import { IsLoadingMapAction, setIsLoadingMap } from "./isLoadingMap.actions"

describe("isLoadingMap", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = isLoadingMap(undefined, {} as IsLoadingMapAction)

			expect(result).toEqual(false)
		})
	})

	describe("Action: SET_IS_LOADING_MAP", () => {
		it("should set new isLoadingMap", () => {
			const result = isLoadingMap(false, setIsLoadingMap(true))

			expect(result).toEqual(true)
		})

		it("should set default isLoadingMap", () => {
			const result = isLoadingMap(true, setIsLoadingMap())

			expect(result).toEqual(false)
		})
	})
})
