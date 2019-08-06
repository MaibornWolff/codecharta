import { goto, puppeteer } from "../../../puppeteer.helper"
import { Browser, Page } from "puppeteer"
import { EdgeChooserPageObject } from "./edgeChooser.po"

jest.setTimeout(10000)

describe("EdgeChooser", () => {
	let browser: Browser
	let page: Page
	let edgeChooser: EdgeChooserPageObject

	beforeAll(async () => {
		browser = await puppeteer.launch({ headless: true })
	})

	afterAll(async () => {
		await browser.close()
	})

	beforeEach(async () => {
		page = await browser.newPage()
		edgeChooser = new EdgeChooserPageObject(page)

		await goto(page)
	})

	it("should do something", async () => {
		expect(await edgeChooser.doSomething()).toContain("SOME_RESULT")
	})
})
