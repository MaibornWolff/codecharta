import { isFileExplorerPinned } from "./isFileExplorerPinned.reducer"
import { setIsFileExplorerPinned, toggleIsFileExplorerPinned } from "./isFileExplorerPinned.actions"

describe("isFileExplorerPinned", () => {
	describe("Action: SET_IS_FILE_EXPLORER_PINNED", () => {
		it("should set new isFileExplorerPinned", () => {
			const result = isFileExplorerPinned(false, setIsFileExplorerPinned({ value: true }))

			expect(result).toEqual(true)
		})
	})

	describe("Action: TOGGLE_IS_FILE_EXPLORER_PINNED", () => {
		it("should toggle state", () => {
			const result = isFileExplorerPinned(false, setIsFileExplorerPinned({ value: true }))
			const toggledResult = isFileExplorerPinned(result, toggleIsFileExplorerPinned())

			expect(toggledResult).toBe(!result)
		})
	})
})
