import { delay, goto, launch, newPage } from "../../../puppeteer.helper"
import { Browser, Page } from "puppeteer"
import { EdgeChooserPageObject } from "./edgeChooser.po"
import { FileChooserPageObject } from "../fileChooser/fileChooser.po"
import { MapTreeViewLevelPageObject } from "../mapTreeView/mapTreeView.level.po"
import { SearchPanelPageObject } from "../searchPanel/searchPanel.po"

describe("MapTreeViewLevel", () => {
	let browser: Browser
	let page: Page

	let edgeChooser: EdgeChooserPageObject
	let fileChooser: FileChooserPageObject
	let mapTreeViewLevel: MapTreeViewLevelPageObject
	let searchPanel: SearchPanelPageObject

	beforeAll(async () => {
		browser = await launch()
	})

	afterAll(async () => {
		await browser.close()
	})

	beforeEach(async () => {
		page = await newPage(browser)
		edgeChooser = new EdgeChooserPageObject(page)
		fileChooser = new FileChooserPageObject(page)
		mapTreeViewLevel = new MapTreeViewLevelPageObject(page)
		searchPanel = new SearchPanelPageObject(page)

		await goto(page)
	})

	describe("EdgeChooser", () => {
		it("should update metrics correctly after switching to a map with different metrics", async () => {
			await fileChooser.openFile("./app/codeCharta/ressources/sample1_with_different_edges.cc.json")
			await delay(1500)

			await edgeChooser.open()
			const metrics = await edgeChooser.getMetrics()

			expect(metrics).toHaveLength(2)
		})

		it("should display the amount of incoming and outgoing edges next to the metric name", async () => {
			await edgeChooser.selectEdgeMetric("pairingRate")
			await searchPanel.toggle()
			await mapTreeViewLevel.hoverNode()

			expect(edgeChooser.isEdgeCountAvailable()).toBeTruthy()
		})

		it("should not display the amount of incoming and outgoing edges of buildings for the none metric", async () => {
			await searchPanel.toggle()
			await mapTreeViewLevel.hoverNode()

			expect(await edgeChooser.isEdgeCountAvailable()).toBeFalsy()
		})
	})
})
