import { goto, launch, newPage } from "../../../puppeteer.helper"
import { NodeContextMenuPageObject } from "./nodeContextMenu.po"
import { Browser, Page } from "puppeteer"
import { SearchPanelModeSelectorPageObject } from "../searchPanelModeSelector/searchPanelModeSelector.po"
import { MapTreeViewLevelPageObject } from "../mapTreeView/mapTreeView.level.po"

describe("NodeContextMenu", () => {
	let browser: Browser
	let page: Page

	let contextMenu: NodeContextMenuPageObject
	let searchPanelModeSelector: SearchPanelModeSelectorPageObject
	let mapTreeViewLevel: MapTreeViewLevelPageObject

	beforeAll(async () => {
		browser = await launch()
	})

	afterAll(async () => {
		await browser.close()
	})

	beforeEach(async () => {
		page = await newPage(browser)
		contextMenu = new NodeContextMenuPageObject(page)
		searchPanelModeSelector = new SearchPanelModeSelectorPageObject(page)
		mapTreeViewLevel = new MapTreeViewLevelPageObject(page)

		await goto(page)
	})

	it("right clicking a folder should open a context menu with color options", async () => {
		await searchPanelModeSelector.toggleTreeView()
		await mapTreeViewLevel.openContextMenu("/root")

		expect(await contextMenu.hasColorButtons()).toBeTruthy()
	})
})
