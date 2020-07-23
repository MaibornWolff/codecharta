import { goto, launch, newPage } from "../../../puppeteer.helper"
import { NodeContextMenuPageObject } from "./nodeContextMenu.po"
import { SearchPanelPageObject } from "../searchPanel/searchPanel.po"
import { Browser, Page } from "puppeteer"

describe("NodeContextMenu", () => {
	let browser: Browser
	let page: Page

	let settingsPanel: SearchPanelPageObject
	let contextMenu: NodeContextMenuPageObject

	beforeAll(async () => {
		browser = await launch()
	})

	afterAll(async () => {
		await browser.close()
	})

	beforeEach(async () => {
		page = await newPage(browser)
		settingsPanel = new SearchPanelPageObject(page)
		contextMenu = new NodeContextMenuPageObject(page)

		await goto(page)
	})

	it("right clicking a folder should open a context menu with color options", async () => {
		await settingsPanel.toggleTreeViewMode()
		await settingsPanel.rightClickRootNodeInTreeViewSearchPanel()

		expect(await contextMenu.hasColorButtons()).toBeTruthy()
	})
})
