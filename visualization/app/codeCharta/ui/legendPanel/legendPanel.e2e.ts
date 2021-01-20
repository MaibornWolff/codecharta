import { goto } from "../../../puppeteer.helper"
import { LegendPanelObject } from "./legendPanel.po"
import { FileChooserPageObject } from "../fileChooser/fileChooser.po"
import { MapTreeViewLevelPageObject } from "../mapTreeView/mapTreeView.level.po"
import { SearchPanelModeSelectorPageObject } from "../searchPanelModeSelector/searchPanelModeSelector.po"

describe("LegendPanel", () => {
	let legendPanelObject: LegendPanelObject
	let fileChooser: FileChooserPageObject
	let mapTreeViewLevel: MapTreeViewLevelPageObject
	let searchPanelModeSelector: SearchPanelModeSelectorPageObject

	beforeEach(async () => {
		legendPanelObject = new LegendPanelObject()
		fileChooser = new FileChooserPageObject()
		mapTreeViewLevel = new MapTreeViewLevelPageObject()
		searchPanelModeSelector = new SearchPanelModeSelectorPageObject()

		await goto()
		await setupTest()
	})

	async function setupTest() {
		await fileChooser.openFiles(["./app/codeCharta/resources/sample1_with_different_edges.cc.json"])
		await legendPanelObject.open()
		await searchPanelModeSelector.toggleTreeView()
		await mapTreeViewLevel.openContextMenu("/root")
		await expect(page).toClick(".colorButton:nth-child(2)", { timeout: 3000 })
	}

	describe("LegendPanel", () => {
		it("should highlight a folder and add to legend", async () => {
			const selectedFolder = await legendPanelObject.getFilename()
			expect(selectedFolder).toEqual("/root")
		})

		it("should remove a highlighted folder and remove from legend", async () => {
			await mapTreeViewLevel.openContextMenu("/root")
			await expect(page).toClick(".colorButton:nth-child(2)", { timeout: 3000 })
			const emptyFilelist = await legendPanelObject.getEmptyLegendIfNoFilenamesExist()
			expect(emptyFilelist).toEqual("")
		})

		it("should highlight two different folders and add both to the legend", async () => {
			await mapTreeViewLevel.openContextMenu("/root/ParentLeaf")
			await expect(page).toClick(".colorButton:nth-child(1)", { timeout: 3000 })
			const selectedFolder = await legendPanelObject.getMultipleFilenames()
			expect(selectedFolder[0]).toEqual("/root")
			expect(selectedFolder[1]).toEqual("/root/ParentLeaf")
		})

		it("should highlight two different folders and add both to the legend then remove the first", async () => {
			await mapTreeViewLevel.openContextMenu("/root/ParentLeaf")
			await expect(page).toClick(".colorButton:nth-child(1)", { timeout: 3000 })
			await mapTreeViewLevel.openContextMenu("/root")
			await expect(page).toClick(".colorButton:nth-child(2)", { timeout: 3000 })
			const selectedFolder = await legendPanelObject.getFilename()
			expect(selectedFolder).toEqual("/root/ParentLeaf")
		})
	})
})
