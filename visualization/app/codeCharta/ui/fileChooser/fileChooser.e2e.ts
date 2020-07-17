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

	it("should load cc.json file", async () => {
		await fileChooser.openFile("./app/codeCharta/assets/sample2.cc.json")

		expect(await filePanel.getSelectedName()).toEqual("sample2.cc.json")
	})

	it("should not load non json file", async () => {
		await fileChooser.openFile("./app/codeCharta/assets/logo.png")

		expect(await filePanel.getSelectedName()).toEqual("sample1.cc.json")
	})
})
