import { goto, newPage, launch } from "../../../puppeteer.helper"
import { SearchPanelModeSelectorPageObject } from "./searchPanelModeSelector.po"

describe("SearchPanelModeSelector", () => {
	let browser, page
	let searchPanelModeSelector: SearchPanelModeSelectorPageObject

	beforeAll(async () => {
		browser = await launch()
	})

	afterAll(async () => {
		await browser.close()
	})

	beforeEach(async () => {
		page = await newPage(browser)
		searchPanelModeSelector = new SearchPanelModeSelectorPageObject(page)

		await goto(page)
	})

	it("should open and close the tree-view when clicking on the tree-view icon", async () => {
		await searchPanelModeSelector.toggleTreeView()

		expect(await searchPanelModeSelector.isTreeViewOpen()).toBeTruthy()

		await searchPanelModeSelector.toggleTreeView()

		expect(await searchPanelModeSelector.isTreeViewOpen()).toBeFalsy()
	})
})
