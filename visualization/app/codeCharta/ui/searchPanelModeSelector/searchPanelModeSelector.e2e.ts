import { goto } from "../../../puppeteer.helper"
import { SearchPanelModeSelectorPageObject } from "./searchPanelModeSelector.po"

describe("SearchPanelModeSelector", () => {
	let searchPanelModeSelector: SearchPanelModeSelectorPageObject

	beforeEach(async () => {
		await goto()

		searchPanelModeSelector = new SearchPanelModeSelectorPageObject()
	})

	it("should open and close the tree-view when clicking on the tree-view icon", async () => {
		await searchPanelModeSelector.toggleTreeView()

		expect(await searchPanelModeSelector.isTreeViewOpen()).toBeTruthy()

		await searchPanelModeSelector.toggleTreeView()

		expect(await searchPanelModeSelector.isTreeViewOpen()).toBeFalsy()
	})
})
