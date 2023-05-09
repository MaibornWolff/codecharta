import { sharpnessMode } from "./sharpnessMode.reducer"
import { setSharpnessMode } from "./sharpnessMode.actions"
import { SharpnessMode } from "../../../../codeCharta.model"

describe("sharpnessMode", () => {
	it("should set new sharpness", () => {
		const result = sharpnessMode(SharpnessMode.Standard, setSharpnessMode({ value: SharpnessMode.PixelRatioAA }))

		expect(result).toEqual(SharpnessMode.PixelRatioAA)
	})
})
