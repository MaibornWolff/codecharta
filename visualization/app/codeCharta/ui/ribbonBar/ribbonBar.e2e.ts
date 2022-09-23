import { goto } from "../../../puppeteer.helper"
import { RibbonBarPageObject } from "./ribbonBar.po"
import { SearchPanelPageObject } from "../searchPanel/searchPanel.po"

//Commented out flaky test

describe("RibbonBar", () => {
	let searchPanel: SearchPanelPageObject
	//let searchPanelModeSelector: SearchPanelModeSelectorPageObject
	let ribbonBar: RibbonBarPageObject
	//let metricChooser: MetricChooserPageObject
	//let mapTreeViewLevel: MapTreeViewLevelPageObject

	beforeEach(async () => {
		searchPanel = new SearchPanelPageObject()
		//searchPanelModeSelector = new SearchPanelModeSelectorPageObject()
		ribbonBar = new RibbonBarPageObject()
		//metricChooser = new MetricChooserPageObject()
		//mapTreeViewLevel = new MapTreeViewLevelPageObject()

		await goto()
	})

	/*it("hovering over a folder should display the sum of metric of all children", async () => {
		await searchPanelModeSelector.toggleTreeView()

		await mapTreeViewLevel.hoverNode("/root")

		const actual = await metricChooser.getAreaMetricValue()
		expect(actual).toContain("600")
	})*/

	it("should open a section, open the search bar and close the section again automatically", async () => {
		const areaPanel = "area-metric"
		const edgePanel = "edge-metric"

		let isAreaSettingsPanelOpen = await ribbonBar.togglePanel(areaPanel, "cc-area-settings-panel")
		expect(isAreaSettingsPanelOpen).toBeTruthy()

		const isSearchPanelOpen = await searchPanel.toggle()
		expect(isSearchPanelOpen).toBeTruthy()
		expect(await ribbonBar.isPanelOpen("cc-area-settings-panel")).toBeFalsy()

		isAreaSettingsPanelOpen = await ribbonBar.togglePanel(areaPanel, "cc-area-settings-panel")
		expect(isAreaSettingsPanelOpen).toBeTruthy()
		expect(await searchPanel.isOpen()).toBeFalsy()

		const isEdgeSettingsPanelOpen = await ribbonBar.togglePanel(edgePanel, "cc-edge-settings-panel")
		expect(isEdgeSettingsPanelOpen).toBeTruthy()
		expect(await ribbonBar.isPanelOpen("cc-area-settings-panel")).toBeFalsy()
	})
})
