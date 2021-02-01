import { sharpnessMode } from "./sharpnessMode.reducer"
import { SharpnessModeAction, setSharpnessMode } from "./sharpnessMode.actions"
import { SharpnessMode } from "../../../../codeCharta.model"

describe("sharpnessMode", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = sharpnessMode(undefined, {} as SharpnessModeAction)

			expect(result).toEqual(SharpnessMode.Standard)
		})
	})

	describe("Action: setSharpnessMode", () => {
		it("should set new sharpness", () => {
			const result = sharpnessMode(SharpnessMode.Standard, setSharpnessMode(SharpnessMode.PixelRatioAA))

			expect(result).toEqual(SharpnessMode.PixelRatioAA)
		})

		it("should set default panelSelection", () => {
			const result = sharpnessMode(SharpnessMode.PixelRatioAA, setSharpnessMode())

			expect(result).toEqual(SharpnessMode.Standard)
		})
	})
})
