import { goto } from "./puppeteer.helper"

describe("app", () => {
	beforeEach(async () => {
		await goto()
	})

	it("should not have errors in console", async () => {
		page.on("console", message => {
			expect(message.type).not.toBe("error")
		})
		await goto()
		await page.waitForSelector("#loading-gif-file", { visible: false })
	})
})
