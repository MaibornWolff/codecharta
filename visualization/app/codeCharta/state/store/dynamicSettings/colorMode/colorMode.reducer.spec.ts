import { colorMode } from "./colorMode.reducer"
import { ColorModeAction, setColorMode } from "./colorMode.actions"
import { ColorMode } from "../../../../codeCharta.model"

describe("colorMode", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = colorMode(undefined, {} as ColorModeAction)

			expect(result).toEqual(ColorMode.weightedGradient)
		})
	})

	describe("Action: SET_COLOR_MODE", () => {
		it("should set new colorMode", () => {
			const result = colorMode(ColorMode.weightedGradient, setColorMode(ColorMode.absolute))

			expect(result).toEqual(ColorMode.absolute)
		})

		it("should set default colorMode", () => {
			const result = colorMode(ColorMode.absolute, setColorMode())

			expect(result).toEqual(ColorMode.weightedGradient)
		})
	})
})
