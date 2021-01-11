import { goto } from "../../../puppeteer.helper"
import { FileChooserPageObject } from "./fileChooser.po"
import { FilePanelPageObject } from "../filePanel/filePanel.po"
import { DialogErrorPageObject } from "../dialog/dialog.error.po"
import { ERROR_MESSAGES } from "../../util/fileValidator"

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
		await fileChooser.openFiles(["./app/codeCharta/assets/sample3.cc.json"])

		expect(await filePanel.getSelectedName()).toEqual("sample3.cc.json")
	})

	it("should load multiple cc.json files", async () => {
		await fileChooser.openFiles(["./app/codeCharta/assets/sample3.cc.json", "./app/codeCharta/assets/sample2.cc.json"])

		const loadedMapsName = await filePanel.getAllNames()

		expect(loadedMapsName[0]).toEqual("sample3.cc.json")
		expect(loadedMapsName[1]).toEqual("sample2.cc.json")
	})

	it("should keep the old map if opening a file was cancelled", async () => {
		await fileChooser.openFiles(["./app/codeCharta/assets/sample3.cc.json"])
		await fileChooser.cancelOpeningFile()

		expect(await filePanel.getSelectedName()).toEqual("sample3.cc.json")
		expect(await page.$eval("#loading-gif-map", element => element["className"])).toContain("ng-hide")
	})

	it("should open an invalid file, close the dialog and open a valid file", async () => {
		await fileChooser.openFiles(["./app/codeCharta/assets/empty.png"])
		expect(await dialogError.getMessage()).toEqual(` ${ERROR_MESSAGES.fileIsInvalid}`)

		await dialogError.clickOk()

		await fileChooser.openFiles(["./app/codeCharta/assets/sample3.cc.json"], false)

		expect(await filePanel.getSelectedName()).toEqual("sample3.cc.json")
	})

	it("should open an valid and an invalid file, close the dialog and open a valid file", async () => {
		await fileChooser.openFiles(["./app/codeCharta/assets/empty.png", "./app/codeCharta/assets/sample3.cc.json"])
		expect(await dialogError.getMessage()).toEqual(` ${ERROR_MESSAGES.fileIsInvalid}`)

		await dialogError.clickOk()

		await fileChooser.openFiles(["./app/codeCharta/assets/sample3.cc.json"], false)

		expect(await filePanel.getSelectedName()).toEqual("sample3.cc.json")
	})

	it("should not load a map and show error, when loading a map with warning and a map with error", async () => {
		await fileChooser.openFiles(["./app/codeCharta/ressources/sample1_with_api_warning.cc.json", "./app/codeCharta/assets/empty.png"])

		expect(await dialogError.getMessage()).toEqual(` ${ERROR_MESSAGES.minorApiVersionOutdated} Found: 1.5`)
		await dialogError.waitUntilDialogIsClosed()

		expect(await dialogError.getMessage()).toEqual(` ${ERROR_MESSAGES.fileIsInvalid}`)
		await dialogError.clickOk()

		await fileChooser.openFiles(["./app/codeCharta/assets/sample3.cc.json"], false)

		expect(await filePanel.getSelectedName()).toEqual("sample3.cc.json")
	})

	it("should be able to open a cc.json with a lower minor api version without a warning", async () => {
		await fileChooser.openFiles(["./app/codeCharta/ressources/sample1_with_lower_minor_api.cc.json"])

		expect(await filePanel.getSelectedName()).toEqual("sample1_with_lower_minor_api.cc.json")
	})
})
