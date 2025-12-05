import { test, expect } from "@playwright/test"
import { clearIndexedDB, clickButtonOnPageElement, goto } from "../../../playwright.helper"
import { LegendPanelObject } from "./legendPanel.po"
import { MapTreeViewLevelPageObject } from "../ribbonBar/searchPanel/mapTreeView/mapTreeView.level.po"
import { UploadFileButtonPageObject } from "../toolBar/uploadFilesButton/uploadFilesButton.po"
import { SearchPanelPageObject } from "../ribbonBar/searchPanel/searchPanel.po"

test.describe("LegendPanel", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    async function setupTest(page) {
        const uploadFilesButton = new UploadFileButtonPageObject(page)
        const mapTreeViewLevel = new MapTreeViewLevelPageObject(page)
        const searchPanel = new SearchPanelPageObject(page)
        const legendPanelObject = new LegendPanelObject(page)

        await uploadFilesButton.openFiles(["./app/codeCharta/resources/sample1_with_different_edges.cc.json"])
        await searchPanel.toggle()
        await mapTreeViewLevel.openContextMenu("/root")
        await clickButtonOnPageElement(page, ".colorButton:nth-child(2)")
        await legendPanelObject.open()

        return { uploadFilesButton, mapTreeViewLevel, searchPanel, legendPanelObject }
    }

    test("should highlight a folder and add to legend", async ({ page }) => {
        const { legendPanelObject } = await setupTest(page)

        const selectedFolder = await legendPanelObject.getFilename()
        expect(selectedFolder).toMatch(/\/root\s*/)
    })

    test("should remove a highlighted folder and remove from legend", async ({ page }) => {
        const { legendPanelObject, searchPanel, mapTreeViewLevel } = await setupTest(page)

        await searchPanel.toggle()
        await mapTreeViewLevel.openContextMenu("/root")
        await clickButtonOnPageElement(page, ".colorButton:nth-child(2)")
        await legendPanelObject.open()
        const emptyFilelist = await legendPanelObject.getEmptyLegendIfNoFilenamesExist()
        expect(emptyFilelist).toEqual("")
    })

    test("should highlight two different folders and add both to the legend then remove the first", async ({ page }) => {
        const { legendPanelObject, searchPanel, mapTreeViewLevel } = await setupTest(page)

        await searchPanel.toggle()
        await mapTreeViewLevel.openContextMenu("/root/ParentLeaf")
        await clickButtonOnPageElement(page, ".colorButton:nth-child(1)")
        await legendPanelObject.open()
        const selectedFolders = await legendPanelObject.getMultipleFilenames()
        expect(selectedFolders[0]).toEqual("/root")
        expect(selectedFolders[1]).toEqual("/root/ParentLeaf")

        await searchPanel.toggle()
        await mapTreeViewLevel.openContextMenu("/root")
        await clickButtonOnPageElement(page, ".colorButton:nth-child(2)")
        await legendPanelObject.open()
        const selectedFolder = await legendPanelObject.getFilename()
        expect(selectedFolder).toMatch("/root/ParentLeaf")
    })
})
