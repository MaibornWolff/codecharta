import { whiteColorBuildings } from "./whiteColorBuildings.reducer"
import { WhiteColorBuildingsAction, setWhiteColorBuildings } from "./whiteColorBuildings.actions"

describe("whiteColorBuildings", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = whiteColorBuildings(undefined, {} as WhiteColorBuildingsAction)

			expect(result).toEqual(false)
		})
	})

	describe("Action: SET_WHITE_COLOR_BUILDINGS", () => {
		it("should set new whiteColorBuildings", () => {
			const result = whiteColorBuildings(false, setWhiteColorBuildings(true))

			expect(result).toEqual(true)
		})
	})
})
