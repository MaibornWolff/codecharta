import { hideFlatBuildings } from "./hideFlatBuildings.reducer"
import { HideFlatBuildingsAction, setHideFlatBuildings } from "./hideFlatBuildings.actions"

describe("hideFlatBuildings", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = hideFlatBuildings(undefined, {} as HideFlatBuildingsAction)

			expect(result).toBeFalsy()
		})
	})

	describe("Action: SET_HIDE_FLAT_BUILDINGS", () => {
		it("should set new hideFlatBuildings", () => {
			const result = hideFlatBuildings(false, setHideFlatBuildings(true))

			expect(result).toBeTruthy()
		})

		it("should set default hideFlatBuildings", () => {
			const result = hideFlatBuildings(true, setHideFlatBuildings())

			expect(result).toBeFalsy()
		})
	})
})
