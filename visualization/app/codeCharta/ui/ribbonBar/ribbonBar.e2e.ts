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
		await goto()

		searchPanel = new SearchPanelPageObject(page)
		searchPanelModeSelector = new SearchPanelModeSelectorPageObject(page)
		ribbonBar = new RibbonBarPageObject(page)
		metricChooser = new MetricChooserPageObject(page)
		mapTreeViewLevel = new MapTreeViewLevelPageObject(page)
	})

	it("hovering over a folder should display the sum of metric of all children", async () => {
		await searchPanelModeSelector.toggleTreeView()
		await mapTreeViewLevel.hoverNode("/root")

		const actual = await metricChooser.getAreaMetricValue()
		expect(actual).toContain("600")
	})

	it("focus of ui element should be removed on ribbonBar toggle", async () => {
		const panel = "color-metric"
		await ribbonBar.togglePanel(panel)
		await ribbonBar.focusSomething()
		const activeBefore = await ribbonBar.getActiveClassName()

		await ribbonBar.togglePanel(panel)

		const activeAfter = await ribbonBar.getActiveClassName()
		expect(activeBefore).not.toBe("ng-scope")
		expect(activeAfter).toBe("ng-scope")
	})

	describe("opening and closing ribbon-bar cards", () => {
		it("searchPanel", async () => {
			expect(await searchPanel.isOpen()).toBeFalsy()

			await searchPanel.toggle()

			expect(await searchPanel.isOpen()).toBeTruthy()

			await searchPanel.toggle()

			expect(await searchPanel.isOpen()).toBeFalsy()
		})

		it("height-metric cad", async () => {
			const panel = "height-metric"

			expect(await ribbonBar.isPanelOpen(panel)).toBeFalsy()

			await ribbonBar.togglePanel(panel)

			expect(await ribbonBar.isPanelOpen(panel)).toBeTruthy()

			await ribbonBar.togglePanel(panel)

			expect(await ribbonBar.isPanelOpen(panel)).toBeFalsy()
		})

		it("area-metric card", async () => {
			const panel = "area-metric"

			expect(await ribbonBar.isPanelOpen(panel)).toBeFalsy()

			await ribbonBar.togglePanel(panel)

			expect(await ribbonBar.isPanelOpen(panel)).toBeTruthy()

			await ribbonBar.togglePanel(panel)

			expect(await ribbonBar.isPanelOpen(panel)).toBeFalsy()
		})

		it("color-metric card", async () => {
			const panel = "color-metric"

			expect(await ribbonBar.isPanelOpen(panel)).toBeFalsy()

			await ribbonBar.togglePanel(panel)

			expect(await ribbonBar.isPanelOpen(panel)).toBeTruthy()

			await ribbonBar.togglePanel(panel)

			expect(await ribbonBar.isPanelOpen(panel)).toBeFalsy()
		})

		it("edge-metric", async () => {
			const panel = "edge-metric"

			expect(await ribbonBar.isPanelOpen(panel)).toBeFalsy()

			await ribbonBar.togglePanel(panel)

			expect(await ribbonBar.isPanelOpen(panel)).toBeTruthy()

			await ribbonBar.togglePanel(panel)

			expect(await ribbonBar.isPanelOpen(panel)).toBeFalsy()
		})
	})
})
