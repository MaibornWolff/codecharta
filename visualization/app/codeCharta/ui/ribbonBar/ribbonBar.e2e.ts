import { CC_URL, delay, goto, puppeteer } from "../../../puppeteer.helper"
import { RibbonBarPageObject } from "./ribbonBar.po"
import { SettingsPanelPageObject } from "../settingsPanel/settingsPanel.po"
import { Browser, Page } from "puppeteer"

jest.setTimeout(10000)

describe("RibbonBar", () => {
	let browser: Browser
	let page: Page

	let settingsPanel: SettingsPanelPageObject
	let ribbonBar: RibbonBarPageObject

	beforeAll(async () => {
		browser = await puppeteer.launch({ headless: true })
	})

	afterAll(async () => {
		await browser.close()
	})

	beforeEach(async () => {
		page = await browser.newPage()

		settingsPanel = new SettingsPanelPageObject(page)
		ribbonBar = new RibbonBarPageObject(page)

		await goto(page)
	})


	it("hovering over a folder should display the sum of metric of all children", async () => {
		await settingsPanel.open()
		await settingsPanel.toggleTreeViewSearchPanel()
		await settingsPanel.rightClickRootNodeInTreeViewSearchPanel()

		const actual = await ribbonBar.getAreaMetricValue()
		expect(actual).toBe("600")
	})

	it("should toggle ribbonBar onClick toggle button", async () => {
		expect(await ribbonBar.getRibbonBarClassList()).not.toContain("expanded")

		await ribbonBar.toggle()

		expect(await ribbonBar.getRibbonBarClassList()).toContain("expanded")

		await ribbonBar.toggle()

		expect(await ribbonBar.getRibbonBarClassList()).not.toContain("expanded")
	})
})
