import { goto } from "../../../puppeteer.helper"
import { SearchBarPageObject } from "./searchBar.po"

describe("Disable searchbar on exclusion of all buildings", () => {
	let searchBar: SearchBarPageObject

	beforeEach(async () => {
		searchBar = new SearchBarPageObject()
		await goto()
	})

	it("should disable searchBar when everything is disabled", async () => {
		await searchBar.enterAndExcludeSearchPattern("*")
		await page.waitForTimeout(500)

		expect(searchBar.searchInputIsDisabled()).toBeTruthy()
	})
})
