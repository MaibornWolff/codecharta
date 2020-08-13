import { goto } from "../../../puppeteer.helper"
import { RibbonBarPageObject } from "./ribbonBar.po"
import { SearchPanelPageObject } from "../searchPanel/searchPanel.po"
import { MetricChooserPageObject } from "../metricChooser/metricChooser.po"
import { SearchPanelModeSelectorPageObject } from "../searchPanelModeSelector/searchPanelModeSelector.po"
import { MapTreeViewLevelPageObject } from "../mapTreeView/mapTreeView.level.po"

describe("RibbonBar", () => {
	let searchPanel: SearchPanelPageObject
	let searchPanelModeSelector: SearchPanelModeSelectorPageObject
	let ribbonBar: RibbonBarPageObject
	let metricChooser: MetricChooserPageObject
	let mapTreeViewLevel: MapTreeViewLevelPageObject

	beforeEach(async () => {
		searchPanel = new SearchPanelPageObject()
		searchPanelModeSelector = new SearchPanelModeSelectorPageObject()
		ribbonBar = new RibbonBarPageObject()
		metricChooser = new MetricChooserPageObject()
		mapTreeViewLevel = new MapTreeViewLevelPageObject()

		await goto()
	})

	it("hovering over a folder should display the sum of metric of all children", async () => {
		await searchPanelModeSelector.toggleTreeView()

		await mapTreeViewLevel.hoverNode("/root")

		const actual = await metricChooser.getAreaMetricValue()
		expect(actual).toContain("600")
	})

	it("focus of ui element should be removed on ribbonBar toggle", async () => {
		const panel = "color-metric"
		let isColorSettingsPanelOpen = await ribbonBar.togglePanel(panel)
		expect(isColorSettingsPanelOpen).toBeTruthy()
		await ribbonBar.focusSomething()
		const activeBefore = await ribbonBar.getActiveClassName()

		isColorSettingsPanelOpen = await ribbonBar.togglePanel(panel)
		expect(isColorSettingsPanelOpen).toBeFalsy()

		const activeAfter = await ribbonBar.getActiveClassName()
		expect(activeBefore).not.toBe("ng-scope")
		expect(activeAfter).toBe("ng-scope")
	})

	describe("opening and closing ribbon-bar cards", () => {
		it("searchPanel", async () => {
			let isSearchPanelOpen = await searchPanel.toggle()
			expect(isSearchPanelOpen).toBeTruthy()

			isSearchPanelOpen = await searchPanel.toggle()
			expect(isSearchPanelOpen).toBeFalsy()
		})

		it("height-metric cad", async () => {
			const panel = "height-metric"

			let isHeightSettingsPanelOpen = await ribbonBar.togglePanel(panel)
			expect(isHeightSettingsPanelOpen).toBeTruthy()

			isHeightSettingsPanelOpen = await ribbonBar.togglePanel(panel)
			expect(isHeightSettingsPanelOpen).toBeFalsy()
		})

		it("area-metric card", async () => {
			const panel = "area-metric"

			let isAreaSettingsPanelOpen = await ribbonBar.togglePanel(panel)
			expect(isAreaSettingsPanelOpen).toBeTruthy()

			isAreaSettingsPanelOpen = await ribbonBar.togglePanel(panel)
			expect(isAreaSettingsPanelOpen).toBeFalsy()
		})

		it("color-metric card", async () => {
			const panel = "color-metric"

			let isColorSettingsPanelOpen = await ribbonBar.togglePanel(panel)
			expect(isColorSettingsPanelOpen).toBeTruthy()

			isColorSettingsPanelOpen = await ribbonBar.togglePanel(panel)
			expect(isColorSettingsPanelOpen).toBeFalsy()
		})

		it("edge-metric", async () => {
			const panel = "edge-metric"

			let isEdgeSettingsPanelOpen = await ribbonBar.togglePanel(panel)
			expect(isEdgeSettingsPanelOpen).toBeTruthy()

			isEdgeSettingsPanelOpen = await ribbonBar.togglePanel(panel)
			expect(isEdgeSettingsPanelOpen).toBeFalsy()
		})
	})
})
