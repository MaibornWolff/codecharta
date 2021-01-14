import { goto } from "../../../puppeteer.helper"
import { LegendPanelObject } from "./legendPanel.po"
import { FileChooserPageObject } from "../fileChooser/fileChooser.po"

describe("CustomConfigs", () => {
	let legendPanelObject: LegendPanelObject
	let fileChooser: FileChooserPageObject

	beforeEach(async () => {
		legendPanelObject = new LegendPanelObject()
		fileChooser = new FileChooserPageObject()

		await goto()
	})

	describe("LegendPanel", () => {
		it("should highlight a folder and add to legend then react to a changed color", async () => {
			await fileChooser.openFiles(["./app/codeCharta/ressources/sample1_with_different_edges.cc.json"])
			await legendPanelObject.open()
		})
	})
})
