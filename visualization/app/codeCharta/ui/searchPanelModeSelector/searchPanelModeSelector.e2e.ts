import { goto } from "../../../puppeteer.helper"
import { SearchPanelModeSelectorPageObject } from "./searchPanelModeSelector.po"

describe("SearchPanelModeSelector", () => {
	let searchPanelModeSelector: SearchPanelModeSelectorPageObject

	beforeEach(async () => {
		searchPanelModeSelector = new SearchPanelModeSelectorPageObject()

		await goto()
	})

	it("should open and close the tree-view when clicking on the tree-view icon", async () => {
		expect(await searchPanelModeSelector.isTreeViewOpen()).toBeFalsy()

		await searchPanelModeSelector.toggleTreeView()

		expect(await searchPanelModeSelector.isTreeViewOpen()).toBeTruthy()

		await searchPanelModeSelector.toggleTreeView()

		expect(await searchPanelModeSelector.isTreeViewOpen()).toBeFalsy()
	})
})
