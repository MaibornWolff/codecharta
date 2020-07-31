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
		expect(await searchPanelModeSelector.toggleTreeView()).toBeTruthy()

		await mapTreeViewLevel.hoverNode("/root")

		const actual = await metricChooser.getAreaMetricValue()
		expect(actual).toContain("600")
	})

	it("focus of ui element should be removed on ribbonBar toggle", async () => {
		const panel = "color-metric"
		expect(await ribbonBar.togglePanel(panel)).toBeTruthy()
		await ribbonBar.focusSomething()
		const activeBefore = await ribbonBar.getActiveClassName()

		expect(await ribbonBar.togglePanel(panel)).toBeFalsy()

		const activeAfter = await ribbonBar.getActiveClassName()
		expect(activeBefore).not.toBe("ng-scope")
		expect(activeAfter).toBe("ng-scope")
	})

	describe("opening and closing ribbon-bar cards", () => {
		it("searchPanel", async () => {
			expect(await searchPanel.isOpen()).toBeFalsy()

			expect(await searchPanel.toggle()).toBeTruthy()

			expect(await searchPanel.toggle()).toBeFalsy()
		})

		it("height-metric cad", async () => {
			const panel = "height-metric"

			expect(await ribbonBar.isPanelOpen(panel)).toBeFalsy()

			expect(await ribbonBar.togglePanel(panel)).toBeTruthy()

			expect(await ribbonBar.togglePanel(panel)).toBeFalsy()
		})

		it("area-metric card", async () => {
			const panel = "area-metric"

			expect(await ribbonBar.isPanelOpen(panel)).toBeFalsy()

			expect(await ribbonBar.togglePanel(panel)).toBeTruthy()

			expect(await ribbonBar.togglePanel(panel)).toBeFalsy()
		})

		it("color-metric card", async () => {
			const panel = "color-metric"

			expect(await ribbonBar.isPanelOpen(panel)).toBeFalsy()

			expect(await ribbonBar.togglePanel(panel)).toBeTruthy()

			expect(await ribbonBar.togglePanel(panel)).toBeFalsy()
		})

		it("edge-metric", async () => {
			const panel = "edge-metric"

			expect(await ribbonBar.isPanelOpen(panel)).toBeFalsy()

			expect(await ribbonBar.togglePanel(panel)).toBeTruthy()

			expect(await ribbonBar.togglePanel(panel)).toBeFalsy()
		})
	})
})
