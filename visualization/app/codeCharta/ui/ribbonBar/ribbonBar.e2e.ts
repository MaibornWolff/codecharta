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
		const isOpen = await searchPanelModeSelector.toggleTreeView()
		expect(isOpen).toBeTruthy()

		await mapTreeViewLevel.hoverNode("/root")

		const actual = await metricChooser.getAreaMetricValue()
		expect(actual).toContain("600")
	})

	it("focus of ui element should be removed on ribbonBar toggle", async () => {
		const panel = "color-metric"
		let isOpen = await ribbonBar.togglePanel(panel)
		expect(isOpen).toBeTruthy()
		await ribbonBar.focusSomething()
		const activeBefore = await ribbonBar.getActiveClassName()

		isOpen = await ribbonBar.togglePanel(panel)
		expect(isOpen).toBeFalsy()

		const activeAfter = await ribbonBar.getActiveClassName()
		expect(activeBefore).not.toBe("ng-scope")
		expect(activeAfter).toBe("ng-scope")
	})

	describe("opening and closing ribbon-bar cards", () => {
		it("searchPanel", async () => {
			expect(await searchPanel.isOpen()).toBeFalsy()

			let isOpen = await searchPanel.toggle()
			expect(isOpen).toBeTruthy()

			isOpen = await searchPanel.toggle()
			expect(isOpen).toBeFalsy()
		})

		it("height-metric cad", async () => {
			const panel = "height-metric"

			expect(await ribbonBar.isPanelOpen(panel)).toBeFalsy()

			let isOpen = await ribbonBar.togglePanel(panel)
			expect(isOpen).toBeTruthy()

			isOpen = await ribbonBar.togglePanel(panel)
			expect(isOpen).toBeFalsy()
		})

		it("area-metric card", async () => {
			const panel = "area-metric"

			expect(await ribbonBar.isPanelOpen(panel)).toBeFalsy()

			let isOpen = await ribbonBar.togglePanel(panel)
			expect(isOpen).toBeTruthy()

			isOpen = await ribbonBar.togglePanel(panel)
			expect(isOpen).toBeFalsy()
		})

		it("color-metric card", async () => {
			const panel = "color-metric"

			expect(await ribbonBar.isPanelOpen(panel)).toBeFalsy()

			let isOpen = await ribbonBar.togglePanel(panel)
			expect(isOpen).toBeTruthy()

			isOpen = await ribbonBar.togglePanel(panel)
			expect(isOpen).toBeFalsy()
		})

		it("edge-metric", async () => {
			const panel = "edge-metric"

			expect(await ribbonBar.isPanelOpen(panel)).toBeFalsy()

			let isOpen = await ribbonBar.togglePanel(panel)
			expect(isOpen).toBeTruthy()

			isOpen = await ribbonBar.togglePanel(panel)
			expect(isOpen).toBeFalsy()
		})
	})
})
