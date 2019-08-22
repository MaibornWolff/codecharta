import { goto, puppeteer } from "../../../puppeteer.helper"
import { Browser, Page } from "puppeteer"
import { AttributeSideBarPageObject } from "./attributeSideBar.po"

jest.setTimeout(10000)

describe("AttributeSideBar", () => {
	let browser: Browser
	let page: Page
	let attributeSideBar: AttributeSideBarPageObject

	beforeAll(async () => {
		browser = await puppeteer.launch({ headless: true })
	})

	afterAll(async () => {
		await browser.close()
	})

	beforeEach(async () => {
		page = await browser.newPage()
		attributeSideBar = new AttributeSideBarPageObject(page)

		await goto(page)
	})

	it("should do something", async () => {
		expect(await attributeSideBar.doSomething()).toContain("SOME_RESULT")
	})
})
