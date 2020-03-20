import { goto, puppeteer } from "../../../puppeteer.helper"
import { Browser, Page } from "puppeteer"
import { SortingControlsPageObject } from "./sortingControls.po"

jest.setTimeout(10000)

describe("SortingControls", () => {
	let browser: Browser
	let page: Page
	let sortingControls: SortingControlsPageObject

	beforeAll(async () => {
		browser = await puppeteer.launch({ headless: true })
	})

	afterAll(async () => {
		await browser.close()
	})

	beforeEach(async () => {
		page = await browser.newPage()
		sortingControls = new SortingControlsPageObject(page)

		await goto(page)
	})

	it("should do something", async () => {
		expect(await sortingControls.doSomething()).toContain("SOME_RESULT")
	})
})
