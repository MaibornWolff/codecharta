import { ScreenshotToClipboardEnabledAction, setScreenshotToClipboardEnabled } from "./screenshotToClipboardEnabled.actions"
import { screenshotToClipboardEnabled } from "./screenshotToClipboardEnabled.reducer"

describe("screenshotToClipboardEnabled", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = screenshotToClipboardEnabled(undefined, {} as ScreenshotToClipboardEnabledAction)

			expect(result).toBeFalsy()
		})
	})

	describe("Action: SET_SCREENSHOT_TO_CLIPBOARD_ENABLED", () => {
		it("should set new screenshotToClipboardEnabled", () => {
			const result = screenshotToClipboardEnabled(false, setScreenshotToClipboardEnabled(true))

			expect(result).toBeTruthy()
		})

		it("should set default screenshotToClipboardEnabled", () => {
			const result = screenshotToClipboardEnabled(true, setScreenshotToClipboardEnabled())

			expect(result).toBeFalsy()
		})
	})
})
