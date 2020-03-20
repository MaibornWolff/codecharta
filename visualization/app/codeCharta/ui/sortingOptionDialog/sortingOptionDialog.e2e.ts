import { goto, puppeteer } from "../../../puppeteer.helper"
import { Browser, Page } from "puppeteer"
import { SortingOptionDialogPageObject } from "./sortingOptionDialog.po"

jest.setTimeout(10000)

describe("SortingOptionDialog", () => {
	let browser: Browser
	let page: Page
	let sortingOptionDialog: SortingOptionDialogPageObject

	beforeAll(async () => {
		browser = await puppeteer.launch({ headless: true })
	})

	afterAll(async () => {
		await browser.close()
	})

	beforeEach(async () => {
		page = await browser.newPage()
		sortingOptionDialog = new SortingOptionDialogPageObject(page)

		await goto(page)
	})

	it("should do something", async () => {
		expect(await sortingOptionDialog.doSomething()).toContain("SOME_RESULT")
	})
})
