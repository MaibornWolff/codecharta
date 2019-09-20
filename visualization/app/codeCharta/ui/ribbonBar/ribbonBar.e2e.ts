import { goto, puppeteer } from "../../../puppeteer.helper"
import { RibbonBarPageObject } from "./ribbonBar.po"
import { SearchPanelPageObject } from "../searchPanel/searchPanel.po"
import { Browser, Page } from "puppeteer"

jest.setTimeout(15000)

describe("RibbonBar", () => {
	let browser: Browser
	let page: Page

	let settingsPanel: SearchPanelPageObject
	let ribbonBar: RibbonBarPageObject

	beforeAll(async () => {
		browser = await puppeteer.launch({ headless: true })
	})

	afterAll(async () => {
		await browser.close()
	})

	beforeEach(async () => {
		page = await browser.newPage()

		settingsPanel = new SearchPanelPageObject(page)
		ribbonBar = new RibbonBarPageObject(page)

		await goto(page)
	})

	it("hovering over a folder should display the sum of metric of all children", async () => {
		await settingsPanel.toggleTreeViewMode()
		await settingsPanel.hoverRootNodeInTreeViewSearchPanel()

		const actual = await ribbonBar.getAreaMetricValue()
		expect(actual).toBe("600")
	})

	it("should toggle ribbonBar onClick toggle button", async () => {
		expect((await ribbonBar.getRibbonBarClassList()).split(" ")).not.toContain("expanded")

		await ribbonBar.toggle()

		expect((await ribbonBar.getRibbonBarClassList()).split(" ")).toContain("expanded")

		await ribbonBar.toggle()

		expect((await ribbonBar.getRibbonBarClassList()).split(" ")).not.toContain("expanded")
	})
})
