import { goto, launch, newPage } from "../../puppeteer.helper"
import { LogoPageObject } from "./logo.po"
import { Browser, Page } from "puppeteer"
import { getVersion } from "../util/version"

jest.setTimeout(20000)

describe("CodeCharta logo", () => {
	let browser: Browser
	let page: Page
	let logo: LogoPageObject

	beforeAll(async () => {
		browser = await launch()
	})

	afterAll(async () => {
		await browser.close()
	})

	beforeEach(async () => {
		page = await newPage(browser)
		logo = new LogoPageObject(page)

		await goto(page)
	})

	it("should have correct version", async () => {
		expect(await logo.getVersion()).toBe(getVersion())
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
