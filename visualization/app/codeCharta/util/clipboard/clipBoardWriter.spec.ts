import userEvent from "@testing-library/user-event"
import { setToClipboard, checkWriteToClipboardAllowed } from "./clipboardWriter"

describe("clipboardWriter", () => {
	describe("setToClipboard", () => {
		it("writes correct data to clipboard when write to clipboard is supported", async () => {
			userEvent.setup()
			const text = "sample-text"
			const blobFromText = new Blob([text], { type: "text/plain" })
			const clipboard = { write: jest.fn() } as any as Clipboard

			global.ClipboardItem = jest.fn().mockReturnValue(blobFromText)
			jest.spyOn(navigator, "clipboard", "get").mockReturnValue(clipboard)

			await setToClipboard(blobFromText)

			expect(navigator.clipboard.write).toHaveBeenCalledWith([blobFromText])
		})
	})

	describe("checkWriteToClipboardAllowed", () => {
		it("returns true when write to clipboard is supported", () => {
			userEvent.setup()
			const clipboard = { write: jest.fn() } as any as Clipboard
			jest.spyOn(navigator, "clipboard", "get").mockReturnValue(clipboard)

			const result = checkWriteToClipboardAllowed()

			expect(result).toBe(true)
		})

		it("returns false when write to clipboard is not supported", () => {
			userEvent.setup()
			const clipboard = {} as any as Clipboard
			jest.spyOn(navigator, "clipboard", "get").mockReturnValue(clipboard)

			const result = checkWriteToClipboardAllowed()

			expect(result).toBe(false)
		})
	})
})
