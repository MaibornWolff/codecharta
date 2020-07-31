import { goto } from "../../../puppeteer.helper"
import { FileChooserPageObject } from "./fileChooser.po"
import { FilePanelPageObject } from "../filePanel/filePanel.po"

describe("FileChooser", () => {
	let fileChooser: FileChooserPageObject
	let filePanel: FilePanelPageObject

	beforeEach(async () => {
		fileChooser = new FileChooserPageObject()
		filePanel = new FilePanelPageObject()

		await goto()
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

	it("should not load non json file", async () => {
		await fileChooser.openFile("./app/codeCharta/assets/logo.png")

		expect(await filePanel.getSelectedName()).toEqual("sample1.cc.json")
	})
})
