import { isPresentationMode } from "./isPresentationMode.reducer"
import { PresentationModeAction, setPresentationMode } from "./isPresentationMode.actions"

describe("isPresentationMode", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = isPresentationMode(undefined, {} as PresentationModeAction)

			expect(result).toBeFalsy()
		})
	})

	describe("Action: SET_PRESENTATION_MODE", () => {
		it("should activate presentation mode", () => {
			const result = isPresentationMode(false, setPresentationMode(true))

			expect(result).toBeTruthy()
		})
	})
})
