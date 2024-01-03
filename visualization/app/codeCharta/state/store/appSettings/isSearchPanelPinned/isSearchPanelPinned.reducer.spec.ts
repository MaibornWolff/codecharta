import { isSearchPanelPinned } from "./isSearchPanelPinned.reducer"
import { setIsSearchPanelPinned, toggleIsSearchPanelPinned } from "./isSearchPanelPinned.actions"

describe("isSearchPanelPinned", () => {
	describe("Action: SET_IS_FILE_EXPLORER_PINNED", () => {
		it("should set new isSearchPanelPinned", () => {
			const result = isSearchPanelPinned(false, setIsSearchPanelPinned({ value: true }))

			expect(result).toEqual(true)
		})
	})

	describe("Action: TOGGLE_IS_FILE_EXPLORER_PINNED", () => {
		it("should toggle state", () => {
			const result = isSearchPanelPinned(false, setIsSearchPanelPinned({ value: true }))
			const toggledResult = isSearchPanelPinned(result, toggleIsSearchPanelPinned())

			expect(toggledResult).toBe(!result)
		})
	})
})
