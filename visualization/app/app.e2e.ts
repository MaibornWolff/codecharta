import { clearIndexedDB, goto } from "./puppeteer.helper"

describe("app", () => {
	beforeEach(async () => {
		await goto()
	})

	afterEach(async () => {
		await clearIndexedDB()
	})

	it("should not have errors in console", async () => {
		page.on("console", message => {
			expect(message.type).not.toBe("error")
		})
		await goto()
		await page.waitForSelector("#loading-gif-file", { visible: false })
	})
})
