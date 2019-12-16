import { whiteColorBuildings } from "./whiteColorBuildings.reducer"
import { WhiteColorBuildingsAction, setWhiteColorBuildings } from "./whiteColorBuildings.actions"

describe("whiteColorBuildings", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = whiteColorBuildings(undefined, {} as WhiteColorBuildingsAction)

			expect(result).toBeFalsy()
		})
	})

	describe("Action: SET_WHITE_COLOR_BUILDINGS", () => {
		it("should set new whiteColorBuildings", () => {
			const result = whiteColorBuildings(false, setWhiteColorBuildings(true))

			expect(result).toBeTruthy()
		})

		it("should set default whiteColorBuildings", () => {
			const result = whiteColorBuildings(true, setWhiteColorBuildings())

			expect(result).toBeFalsy()
		})
	})
})
