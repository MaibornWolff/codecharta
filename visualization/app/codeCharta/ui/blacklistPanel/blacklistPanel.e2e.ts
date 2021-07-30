import { goto } from "../../../puppeteer.helper"
import { BlacklistPanelPageObject } from "../blacklistPanel/blacklistPanel.po"
import { SearchBarPageObject } from "../searchBar/searchBar.po"
import { SearchPanelModeSelectorPageObject } from "../searchPanelModeSelector/searchPanelModeSelector.po"
import { ERROR_MESSAGES } from "../../util/fileValidator"
import { DialogErrorPageObject } from "../dialog/dialog.error.po"
import pti from "puppeteer-to-istanbul"

describe("Blacklist(TrackByEvaluation)", () => {
	let searchBar: SearchBarPageObject
	let searchPanelModeSelector: SearchPanelModeSelectorPageObject
	let blacklistPanelPageObject: BlacklistPanelPageObject
	let dialogError: DialogErrorPageObject

	beforeEach(async () => {
		searchBar = new SearchBarPageObject()
		searchPanelModeSelector = new SearchPanelModeSelectorPageObject()
		blacklistPanelPageObject = new BlacklistPanelPageObject()
		dialogError = new DialogErrorPageObject()
		await Promise.all([page.coverage.startJSCoverage(), page.coverage.startCSSCoverage()])
		await goto()
	})

	afterEach(async () => {
		const [jsCoverage, cssCoverage] = await Promise.all([page.coverage.stopJSCoverage(), page.coverage.stopCSSCoverage()])
		pti.write([...jsCoverage, ...cssCoverage], { includeHostname: true, storagePath: "./dist/e2eCoverage" })
	})

	it("should display error when all files are excluded", async () => {
		await searchBar.enterAndExcludeSearchPattern("*")

		expect(await dialogError.getMessage()).toEqual(ERROR_MESSAGES.blacklistError)
	})

	it("should have correct list entries in case of track by", async () => {
		await searchBar.enterAndExcludeSearchPattern("ts,html")
		await searchPanelModeSelector.toggleBlacklistView()
		const paths = ["*ts*", "*html*"]
		const inList = await blacklistPanelPageObject.checkExludedListAfterExclusion(paths)
		expect(inList).toBeTruthy()
	})

	it("should have correct list entries after exclusion in case of track by", async () => {
		await searchBar.enterAndExcludeSearchPattern("ts,html")
		await searchPanelModeSelector.toggleBlacklistView()
		const excluded = await blacklistPanelPageObject.checkExludedListAfterItemRemovalFromExclusionList()
		expect(excluded).toBeTruthy()
	})
})
