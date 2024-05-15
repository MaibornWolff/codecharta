import { clearIndexedDB, clickButtonOnPageElement, goto } from "../../../puppeteer.helper"
import { expect } from "@jest/globals"
import { LegendPanelObject } from "./legendPanel.po"
import { MapTreeViewLevelPageObject } from "../searchPanel/mapTreeView/mapTreeView.level.po"
import { SearchPanelModeSelectorPageObject } from "../searchPanel/searchPanelModeSelector/searchPanelModeSelector.po"
import { UploadFileButtonPageObject } from "../toolBar/uploadFilesButton/uploadFilesButton.po"

describe("LegendPanel", () => {
    let legendPanelObject: LegendPanelObject
    let uploadFilesButton: UploadFileButtonPageObject
    let mapTreeViewLevel: MapTreeViewLevelPageObject
    let searchPanelModeSelector: SearchPanelModeSelectorPageObject

    beforeEach(async () => {
        legendPanelObject = new LegendPanelObject()
        uploadFilesButton = new UploadFileButtonPageObject()
        mapTreeViewLevel = new MapTreeViewLevelPageObject()
        searchPanelModeSelector = new SearchPanelModeSelectorPageObject()

        await goto()
        await setupTest()
    })

    afterEach(async () => {
        await clearIndexedDB()
    })

    async function setupTest() {
        await uploadFilesButton.openFiles(["./app/codeCharta/resources/sample1_with_different_edges.cc.json"])
        await legendPanelObject.open()
        await searchPanelModeSelector.toggleTreeView()
        await mapTreeViewLevel.openContextMenu("/root")
        await clickButtonOnPageElement(".colorButton:nth-child(2)")
    }

    it("should highlight a folder and add to legend", async () => {
        const selectedFolder = await legendPanelObject.getFilename()
        expect(selectedFolder).toMatch(/\/root\s*/)
    })

    it("should remove a highlighted folder and remove from legend", async () => {
        await mapTreeViewLevel.openContextMenu("/root")
        await clickButtonOnPageElement(".colorButton:nth-child(2)")
        const emptyFilelist = await legendPanelObject.getEmptyLegendIfNoFilenamesExist()
        expect(emptyFilelist).toEqual("")
    })

    it("should highlight two different folders and add both to the legend", async () => {
        await mapTreeViewLevel.openContextMenu("/root/ParentLeaf")
        await clickButtonOnPageElement(".colorButton:nth-child(1)")
        const selectedFolder = await legendPanelObject.getMultipleFilenames()
        expect(selectedFolder[0]).toEqual("/root")
        expect(selectedFolder[1]).toEqual("/root/ParentLeaf")
    })

    it("should highlight two different folders and add both to the legend then remove the first", async () => {
        await mapTreeViewLevel.openContextMenu("/root/ParentLeaf")
        await clickButtonOnPageElement(".colorButton:nth-child(1)")
        await mapTreeViewLevel.openContextMenu("/root")
        await clickButtonOnPageElement(".colorButton:nth-child(2)")
        const selectedFolder = await legendPanelObject.getFilename()
        expect(selectedFolder).toMatch(/root\/ParentLeaf\s*/)
    })
})
