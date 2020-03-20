import { goto, puppeteer } from "../../../puppeteer.helper"
import { Browser, Page } from "puppeteer"
import { SortingButtonPageObject } from "./sortingButton.po"

jest.setTimeout(10000)

describe("SortingButton", () => {
	let browser: Browser
	let page: Page
	let sortingButton: SortingButtonPageObject

	beforeAll(async () => {
		browser = await puppeteer.launch({ headless: true })
	})

	afterAll(async () => {
		await browser.close()
	})

	beforeEach(async () => {
		page = await browser.newPage()
		sortingButton = new SortingButtonPageObject(page)

		await goto(page)
	})

	it("should do something", async () => {
		expect(await sortingButton.doSomething()).toContain("SOME_RESULT")
	})
})
