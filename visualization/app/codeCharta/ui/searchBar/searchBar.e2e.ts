import { goto } from "../../../puppeteer.helper"
import { SearchPanelModeSelectorPageObject } from "../searchPanelModeSelector/searchPanelModeSelector.po"
import { SearchBarPageObject } from "./searchBar.po"

describe("Disable searchbar on exclusion of all buildings", () => {
	let searchBar: SearchBarPageObject
	let searchPanelModeSelector: SearchPanelModeSelectorPageObject

	beforeEach(async () => {
		searchBar = new SearchBarPageObject()
		searchPanelModeSelector = new SearchPanelModeSelectorPageObject()
		await goto()
	})

	it("should disable searchBar when everything is disabled", async () => {
		await searchBar.enterAndExcludeSearchPattern("*")

		expect(searchBar.searchInputIsDisabled()).toBeTruthy()

		await searchPanelModeSelector.toggleBlacklistView()
		// await page.waitForSelector("#excludedList", { visible: true, hidden: false })

		// await clickButtonOnPageElement("#object-0")

		// await searchPanelModeSelector.toggleBlacklistView()
	})
})
