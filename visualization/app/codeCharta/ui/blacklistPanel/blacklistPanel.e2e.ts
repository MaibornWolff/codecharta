import { goto } from "../../../puppeteer.helper"
import { BlacklistPanelPageObject } from "../blacklistPanel/blacklistPanel.po"
import { SearchBarPageObject } from "../searchBar/searchBar.po"
import { SearchPanelPageObject } from "../searchPanel/searchPanel.po"
import { SearchPanelModeSelectorPageObject } from "../searchPanelModeSelector/searchPanelModeSelector.po"

describe("Blacklist(TrackByEvaluation)", () => {
	let searchBar: SearchBarPageObject
	let searchPanelPageObject : SearchPanelPageObject
	let searchPanelModeSelector: SearchPanelModeSelectorPageObject
	let blacklistPanelPageObject: BlacklistPanelPageObject

	beforeEach(async () => {
		searchBar = new SearchBarPageObject()
		searchPanelPageObject = new SearchPanelPageObject()
		searchPanelModeSelector = new SearchPanelModeSelectorPageObject()
		blacklistPanelPageObject = new BlacklistPanelPageObject()
		await goto()
	})

	it("should have correct list entries in case of track by", async () => {
		const excluded = await searchBar.enterAndExcludeSearchPattern()
		expect(excluded).toBeTruthy()
		const toggled = await searchPanelPageObject.toggle()
		expect(toggled).toBeFalsy()
		const spClicked = await searchPanelModeSelector.toggleBlacklistView()
		expect(spClicked).toBeTruthy()
		const inList = await blacklistPanelPageObject.checkExludedListAfterExclusion()
		expect(inList).toBeTruthy()
	})

	it("should have correct list entries after exclusion in case of track by", async () => {
		await searchBar.enterAndExcludeSearchPattern()
		await searchPanelModeSelector.toggleBlacklistView()
		const excluded = await blacklistPanelPageObject.checkExludedListAfterItemRemovalFromExclusionList()
		expect(excluded).toBeTruthy()
	})
})