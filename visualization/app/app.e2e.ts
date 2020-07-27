import { CC_URL, delay, goto } from "./puppeteer.helper"

describe("app", () => {
	beforeEach(async () => {
		await goto()
	})

	it("should not have errors in console", async () => {
		page.on("console", msg => {
			expect(msg.type).not.toBe("error")
		})
		await page.goto(CC_URL)
		await delay(3000)
	})
})
