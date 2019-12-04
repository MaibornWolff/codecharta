import { hideFlatBuildings } from "./hideFlatBuildings.reducer"
import { HideFlatBuildingsAction, setHideFlatBuildings } from "./hideFlatBuildings.actions"

describe("hideFlatBuildings", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = hideFlatBuildings(undefined, {} as HideFlatBuildingsAction)

			expect(result).toBeTruthy()
		})
	})

	describe("Action: SET_HIDE_FLAT_BUILDINGS", () => {
		it("should set new hideFlatBuildings", () => {
			const result = hideFlatBuildings(true, setHideFlatBuildings(false))

			expect(result).toBeFalsy()
		})

		it("should set new hideFlatBuildings", () => {
			const result = hideFlatBuildings(false, setHideFlatBuildings())

			expect(result).toBeTruthy()
		})
	})
})
