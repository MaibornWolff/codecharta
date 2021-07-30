import { goto } from "../../../puppeteer.helper"
import { SharpnessMode } from "../../codeCharta.model"
import { FileChooserPageObject } from "../fileChooser/fileChooser.po"
import { DialogGlobalSettingsPageObject } from "./dialog.globalSettings.po"
import pti from "puppeteer-to-istanbul"

describe("DialogGlobalSettings", () => {
	let globalSettingsPageObject: DialogGlobalSettingsPageObject
	let fileChooser: FileChooserPageObject

	beforeEach(async () => {
		globalSettingsPageObject = new DialogGlobalSettingsPageObject()
		fileChooser = new FileChooserPageObject()
		await Promise.all([page.coverage.startJSCoverage(), page.coverage.startCSSCoverage()])

		await goto()
		await setupTest()
	})

	afterEach(async () => {
		const [jsCoverage, cssCoverage] = await Promise.all([page.coverage.stopJSCoverage(), page.coverage.stopCSSCoverage()])
		pti.write([...jsCoverage, ...cssCoverage], { includeHostname: true, storagePath: "./dist/e2eCoverage" })
	})

	async function setupTest() {
		await fileChooser.openFiles(["./app/codeCharta/resources/sample1_with_different_edges.cc.json"])
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
		it("should should maximum-tree-map slider when TreeMapStreet is chosen as layout", async () => {
			await globalSettingsPageObject.changeLayoutToTreeMapStreet()

			await globalSettingsPageObject.isTreeMapFilesComponentVisible()
		})

		it("should change the display quality to Pixel Ratio without Antialiasing", async () => {
			await globalSettingsPageObject.changedDisplayQuality()

			const layout = await globalSettingsPageObject.getDisplayQuality()

			expect(layout).toEqual(SharpnessMode.PixelRatioNoAA)
		})
	})
})
