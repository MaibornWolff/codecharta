import { goto } from "../../../puppeteer.helper"
import { FileChooserPageObject } from "./fileChooser.po"
import { FilePanelPageObject } from "../filePanel/filePanel.po"
import { DialogErrorPageObject } from "../dialog/dialog.error.po"

describe("FileChooser", () => {
	let fileChooser: FileChooserPageObject
	let filePanel: FilePanelPageObject
	let dialogError: DialogErrorPageObject

	beforeEach(async () => {
		fileChooser = new FileChooserPageObject()
		filePanel = new FilePanelPageObject()
		dialogError = new DialogErrorPageObject()

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

	it("should open an invalid file, close the dialog and open a valid file", async () => {
		await fileChooser.openFile("./app/codeCharta/assets/logo.png")
		expect(await dialogError.getMessage()).toEqual(" file is empty or invalid")

		await dialogError.clickOk()

		await FileChooserPageObject.selectFile("./app/codeCharta/assets/sample3.cc.json")

		expect(await filePanel.getSelectedName()).toEqual("sample3.cc.json")
	})
})
