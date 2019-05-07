import { CC_URL, puppeteer } from "../../../puppeteer.helper"

jest.setTimeout(10000)

describe("AreaSettingsPanel", () => {
	let browser, page

	beforeAll(async () => {
		browser = await puppeteer.launch()
		page = await browser.newPage()
	})

	afterAll(async () => {
		await browser.close()
	})

	it("should do something", async () => {
		await page.goto(CC_URL)
	})
})
