import { HSL } from "./hsl"

describe("HSL", () => {
	let hsl: HSL

	beforeEach(() => {
		hsl = new HSL(10, 20, 30)
	})

	describe("decreaseLightness", () => {
		it("should decrease lightness by a value", () => {
			hsl.decreaseLightness(10)

			expect(hsl.getLightness()).toBe(20)
		})
	})

	describe("toHex", () => {
		it("should convert the hsl to hex", () => {
			expect(hsl.toHex()).toEqual("#5C423D")
		})
	})

	describe("toString", () => {
		it("should convert the hsl to a string for css", () => {
			expect(hsl.toString()).toEqual("hsl(10, 20%, 30%)")
		})
	})
})
