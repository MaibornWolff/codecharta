import { delay, goto, launch, newPage } from "../../../puppeteer.helper"
import { Browser, Page } from "puppeteer"
import { EdgeChooserPageObject } from "./edgeChooser.po"
import { FileChooserPageObject } from "../fileChooser/fileChooser.po"

describe("MapTreeViewLevel", () => {
	let browser: Browser
	let page: Page

	let edgeChooser: EdgeChooserPageObject
	let fileChooser: FileChooserPageObject

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
	})
})
