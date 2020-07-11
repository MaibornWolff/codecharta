import { goto, newPage, launch } from "../../../puppeteer.helper"
import { FileChooserPageObject } from "./fileChooser.po"
import { FilePanelPageObject } from "../filePanel/filePanel.po"

jest.setTimeout(60000)

describe("FileChooser", () => {
	let browser, page
	let fileChooser: FileChooserPageObject
	let filePanel: FilePanelPageObject

	beforeAll(async () => {
		browser = await launch()
	})

	afterAll(async () => {
		await browser.close()
	})

	beforeEach(async () => {
		page = await newPage(browser)
		fileChooser = new FileChooserPageObject(page)
		filePanel = new FilePanelPageObject(page)

		await goto(page)
	})

	it("should load another cc.json", async () => {
		await fileChooser.openFile("./app/codeCharta/assets/sample3.cc.json")

		expect(await filePanel.getSelectedName()).toEqual("sample3.cc.json")
	})

	it("should keep the old map if opening a file was cancelled", async () => {
		await fileChooser.openFile("./app/codeCharta/assets/sample3.cc.json")
		await fileChooser.cancelOpeningFile()

		expect(await filePanel.getSelectedName()).toEqual("sample3.cc.json")
		expect(await page.$eval("#loading-gif-map", el => el["className"])).toContain("ng-hide")
	})
})
