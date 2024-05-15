import { setScreenshotToClipboardEnabled } from "./screenshotToClipboardEnabled.actions"
import { screenshotToClipboardEnabled } from "./screenshotToClipboardEnabled.reducer"

describe("screenshotToClipboardEnabled", () => {
    it("should set new screenshotToClipboardEnabled", () => {
        const result = screenshotToClipboardEnabled(false, setScreenshotToClipboardEnabled({ value: true }))

        expect(result).toBeTruthy()
    })
})
