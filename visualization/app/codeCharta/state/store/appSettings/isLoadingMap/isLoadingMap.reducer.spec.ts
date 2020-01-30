import { isLoadingMap } from "./isLoadingMap.reducer"
import { IsLoadingMapAction, setIsLoadingMap } from "./isLoadingMap.actions"

describe("isLoadingMap", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = isLoadingMap(undefined, {} as IsLoadingMapAction)

			expect(result).toBeTruthy()
		})
	})

	describe("Action: SET_IS_LOADING_MAP", () => {
		it("should set new isLoadingMap", () => {
			const result = isLoadingMap(true, setIsLoadingMap(false))

			expect(result).toBeFalsy()
		})

		it("should set default isLoadingMap", () => {
			const result = isLoadingMap(false, setIsLoadingMap())

			expect(result).toBeTruthy()
		})
	})
})
