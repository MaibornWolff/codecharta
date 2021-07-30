import { goto } from "../../../puppeteer.helper"
import { SearchPanelModeSelectorPageObject } from "./searchPanelModeSelector.po"
import pti from "puppeteer-to-istanbul"

describe("SearchPanelModeSelector", () => {
	let searchPanelModeSelector: SearchPanelModeSelectorPageObject

	beforeEach(async () => {
		searchPanelModeSelector = new SearchPanelModeSelectorPageObject()
		await Promise.all([page.coverage.startJSCoverage(), page.coverage.startCSSCoverage()])

		await goto()
	})

	afterEach(async () => {
		const [jsCoverage, cssCoverage] = await Promise.all([page.coverage.stopJSCoverage(), page.coverage.stopCSSCoverage()])
		pti.write([...jsCoverage, ...cssCoverage], { includeHostname: true, storagePath: "./dist/e2eCoverage" })
	})

	it("should open and close the tree-view when clicking on the tree-view icon", async () => {
		let isTreeViewOpen = await searchPanelModeSelector.toggleTreeView()
		expect(isTreeViewOpen).toBeTruthy()

		isTreeViewOpen = await searchPanelModeSelector.toggleTreeView()
		expect(isTreeViewOpen).toBeFalsy()
	})
})
