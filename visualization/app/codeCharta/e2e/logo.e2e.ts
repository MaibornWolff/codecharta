import { CC_URL, puppeteer } from "../../puppeteer.helper"
import { LogoPageObject } from "./logo.po"

jest.setTimeout(10000)

describe("CodeCharta logo", () => {
	let browser, page, logo

	beforeAll(async () => {
		browser = await puppeteer.launch()
		page = await browser.newPage()
		await page.goto(CC_URL)
		logo = new LogoPageObject(page)
	})

	afterAll(async () => {
		await browser.close()
	})

	it("should have correct version", async () => {
		expect(await logo.getVersion()).toBe(require("../../../package.json").version)
	})

	it("should have correct link", async () => {
		expect(await logo.getLink()).toContain("maibornwolff.de")
	})

	it("should have correct image as logo", async () => {
		const src = await logo.getImageSrc()
		const viewSource = await page.goto(src)
		expect(await viewSource.buffer()).toMatchSnapshot()
	})
})
