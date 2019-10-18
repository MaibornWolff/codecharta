import { goto, launch } from "../../../puppeteer.helper"
import { RibbonBarPageObject } from "./ribbonBar.po"
import { SearchPanelPageObject } from "../searchPanel/searchPanel.po"
import { Browser, Page } from "puppeteer"

jest.setTimeout(15000)

describe("RibbonBar", () => {
	let browser: Browser
	let page: Page

	let searchPanel: SearchPanelPageObject
	let ribbonBar: RibbonBarPageObject

	beforeAll(async () => {
		browser = await launch()
	})

	afterAll(async () => {
		await browser.close()
	})

	beforeEach(async () => {
		page = await browser.newPage()

		searchPanel = new SearchPanelPageObject(page)
		ribbonBar = new RibbonBarPageObject(page)

		await goto(page)
	})

	it("hovering over a folder should display the sum of metric of all children", async () => {
		await searchPanel.toggleTreeViewMode()
		await searchPanel.hoverRootNodeInTreeViewSearchPanel()

		const actual = await ribbonBar.getAreaMetricValue()
		expect(actual).toBe("600")
	})

	it("should open and close the searchPanel", async () => {
		expect(await searchPanel.isOpen()).toBeFalsy()

		await searchPanel.toggle()

		expect(await searchPanel.isOpen()).toBeTruthy()

		await searchPanel.toggle()

		expect(await searchPanel.isOpen()).toBeFalsy()
	})

	it("should open and close the height-metric cad", async () => {
		const panel = "height-metric"

		expect(await ribbonBar.isPanelOpen(panel)).toBeFalsy()

		await ribbonBar.togglePanel(panel)

		expect(await ribbonBar.isPanelOpen(panel)).toBeTruthy()

		await ribbonBar.togglePanel(panel)

		expect(await ribbonBar.isPanelOpen(panel)).toBeFalsy()
	})

	it("should open and close the area-metric card", async () => {
		const panel = "area-metric"

		expect(await ribbonBar.isPanelOpen(panel)).toBeFalsy()

		await ribbonBar.togglePanel(panel)

		expect(await ribbonBar.isPanelOpen(panel)).toBeTruthy()

		await ribbonBar.togglePanel(panel)

		expect(await ribbonBar.isPanelOpen(panel)).toBeFalsy()
	})

	it("should open and close the color-metric card", async () => {
		const panel = "color-metric"

		expect(await ribbonBar.isPanelOpen(panel)).toBeFalsy()

		await ribbonBar.togglePanel(panel)

		expect(await ribbonBar.isPanelOpen(panel)).toBeTruthy()

		await ribbonBar.togglePanel(panel)

		expect(await ribbonBar.isPanelOpen(panel)).toBeFalsy()
	})

	it("should open and close the edge-metric", async () => {
		const panel = "edge-metric"

		expect(await ribbonBar.isPanelOpen(panel)).toBeFalsy()

		await ribbonBar.togglePanel(panel)

		expect(await ribbonBar.isPanelOpen(panel)).toBeTruthy()

		await ribbonBar.togglePanel(panel)

		expect(await ribbonBar.isPanelOpen(panel)).toBeFalsy()
	})
})
