import { goto } from "../../../puppeteer.helper"
import { FileChooserPageObject } from "../fileChooser/fileChooser.po"
import { DialogGlobalSettingsPageObject } from "./dialog.globalSettings.po"

describe("LegendPanel", () => {
	let globalSettingsPageObject: DialogGlobalSettingsPageObject
	let fileChooser: FileChooserPageObject

	beforeEach(async () => {
		globalSettingsPageObject = new DialogGlobalSettingsPageObject()
		fileChooser = new FileChooserPageObject()

		await goto()
		await setupTest()
	})

	async function setupTest() {
		await fileChooser.openFiles(["./app/codeCharta/ressources/sample1_with_different_edges.cc.json"])
		await globalSettingsPageObject.openGlobalSettings()
	}

	describe("GlobalSettings", () => {
		it("Should contain the label for the map layout", async () => {
			const label = await globalSettingsPageObject.getMapLayoutLabel()
			expect(label).toEqual("Map Layout")
		})
		it("Should contain the Display quality Layout", async () => {
			const label = await globalSettingsPageObject.getDisplayQualityLabel()
			expect(label).toEqual("Display quality")
		})
		/*
		it("Should change the layout algorithm", async () => {
			globalSettingsPageObject.changeLayout()
			globalSettingsPageObject.setStreetMapAsLayout()
			const label = await globalSettingsPageObject.getLayout()
			console.log("this.is.it ", label)
		})
*/
	})
})
