import { goto, launch, newPage } from "../../../puppeteer.helper"
import { Browser, Page } from "puppeteer"
import { MapTreeViewLevelPageObject } from "./mapTreeView.level.po"
import { SearchPanelModeSelectorPageObject } from "../searchPanelModeSelector/searchPanelModeSelector.po"
import { NodeContextMenuPageObject } from "../nodeContextMenu/nodeContextMenu.po"

jest.setTimeout(60000)

describe("MapTreeViewLevel", () => {
	let browser: Browser
	let page: Page

	let mapTreeViewLevel: MapTreeViewLevelPageObject
	let searchPanelModeSelector: SearchPanelModeSelectorPageObject
	let nodeContextMenu: NodeContextMenuPageObject

	beforeAll(async () => {
		browser = await launch()
	})

	afterAll(async () => {
		await browser.close()
	})

	beforeEach(async () => {
		page = await newPage(browser)
		mapTreeViewLevel = new MapTreeViewLevelPageObject(page)
		searchPanelModeSelector = new SearchPanelModeSelectorPageObject(page)
		nodeContextMenu = new NodeContextMenuPageObject(page)

		await goto(page)
	})

	describe("Blacklist", () => {
		it("excluding a building should exclude it from the tree-view as well", async () => {
			await searchPanelModeSelector.openTreeView()
			await mapTreeViewLevel.openContextMenu()
			await nodeContextMenu.exclude()

			expect(await mapTreeViewLevel.nodeExists()).toBeFalsy()
		})
	})
})
