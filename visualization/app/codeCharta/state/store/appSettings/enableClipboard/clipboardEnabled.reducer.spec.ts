import { ClipboardEnabledAction, setClipboardEnabled } from "./clipboardEnabled.actions"
import { clipboardEnabled } from "./clipboardEnabled.reducer"

describe("clipboardEnabled", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = clipboardEnabled(undefined, {} as ClipboardEnabledAction)

			expect(result).toBeFalsy()
		})
	})

	describe("Action: SET_CLIPBOARD_ENABLED", () => {
		it("should set new clipboardEnabled", () => {
			const result = clipboardEnabled(false, setClipboardEnabled(true))

			expect(result).toBeTruthy()
		})

		it("should set default clipboardEnabled", () => {
			const result = clipboardEnabled(true, setClipboardEnabled())

			expect(result).toBeFalsy()
		})
	})
})
