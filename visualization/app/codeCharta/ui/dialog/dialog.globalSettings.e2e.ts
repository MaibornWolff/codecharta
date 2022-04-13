import { goto } from "../../../puppeteer.helper"
import { SharpnessMode } from "../../codeCharta.model"
import { UploadFileButtonPageObject } from "../toolBar/uploadFilesButton/uploadFilesButton.po"
import { DialogGlobalSettingsPageObject } from "./dialog.globalSettings.po"

describe("DialogGlobalSettings", () => {
	let globalSettingsPageObject: DialogGlobalSettingsPageObject
	let uploadFilesButton: UploadFileButtonPageObject

	beforeEach(async () => {
		globalSettingsPageObject = new DialogGlobalSettingsPageObject()
		uploadFilesButton = new UploadFileButtonPageObject()

		await goto()
		await setupTest()
	})

	async function setupTest() {
		await uploadFilesButton.openFiles(["./app/codeCharta/resources/sample1_with_different_edges.cc.json"])
		await globalSettingsPageObject.openGlobalSettings()
	}

	describe("Map Layout", () => {
		it("should contain the label for the map layout", async () => {
			const label = await globalSettingsPageObject.getMapLayoutLabel()

			expect(label).toEqual("Map Layout")
		})
		it("should contain the Display quality Layout", async () => {
			const label = await globalSettingsPageObject.getDisplayQualityLabel()

			expect(label).toEqual("Display quality")
		})

		//DISABLED test due to flakyness
		/*it("should change the layout algorithm", async () => {
			await globalSettingsPageObject.changeLayoutToTreeMapStreet()

			const layout = await globalSettingsPageObject.getLayout()

			expect(layout).toEqual(LayoutAlgorithm.TreeMapStreet)
		})*/
	})

	describe("Display Quality", () => {
		it("should show maximum-tree-map slider when TreeMapStreet is chosen as layout", async () => {
			await globalSettingsPageObject.changeLayoutToTreeMapStreet()

			await globalSettingsPageObject.isTreeMapFilesComponentVisible()
		})

		it("should change the display quality to Low Setting", async () => {
			await globalSettingsPageObject.changedDisplayQuality()

			const layout = await globalSettingsPageObject.getDisplayQuality()

			expect(layout).toContain(SharpnessMode.PixelRatioNoAA)
		})
	})
})
