import { isWhiteBackground } from "./isWhiteBackground.reducer"
import { IsWhiteBackgroundAction, setIsWhiteBackground } from "./isWhiteBackground.actions"

describe("isWhiteBackground", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = isWhiteBackground(undefined, {} as IsWhiteBackgroundAction)

			expect(result).toEqual(false)
		})
	})

	describe("Action: SET_IS_WHITE_BACKGROUND", () => {
		it("should set new isWhiteBackground", () => {
			const result = isWhiteBackground(false, setIsWhiteBackground(true))

			expect(result).toEqual(true)
		})
	})
})
