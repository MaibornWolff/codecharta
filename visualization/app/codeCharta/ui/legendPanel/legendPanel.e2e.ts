import { test, expect } from "@playwright/test"
import { clearIndexedDB, clickButtonOnPageElement, goto } from "../../../playwright.helper"
import { LegendPanelObject } from "./legendPanel.po"
import { ExplorerTreeLevelPageObject } from "../../features/sidebarExplorer/components/explorerTreeLevel/explorerTreeLevel.po"
import { NavBarFolderButtonPageObject } from "../../features/navBar/components/navBarFolderButton/navBarFolderButton.po"

test.describe("LegendPanel", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    async function setupTest(page) {
        const uploadFilesButton = new NavBarFolderButtonPageObject(page)
        const explorerTreeLevel = new ExplorerTreeLevelPageObject(page)
        const legendPanelObject = new LegendPanelObject(page)

        await uploadFilesButton.openFiles(["./app/codeCharta/resources/sample1_with_different_edges.cc.json"])
        await explorerTreeLevel.openContextMenu("/root")
        await clickButtonOnPageElement(page, ".colorButton:nth-child(2)")
        await legendPanelObject.open()

        return { uploadFilesButton, explorerTreeLevel, legendPanelObject }
    }

    test("should highlight a folder and add to legend", async ({ page }) => {
        const { legendPanelObject } = await setupTest(page)

        const selectedFolder = await legendPanelObject.getFilename()
        expect(selectedFolder).toMatch(/\/root\s*/)
    })

    test("should remove a highlighted folder and remove from legend", async ({ page }) => {
        const { legendPanelObject, explorerTreeLevel } = await setupTest(page)

        await explorerTreeLevel.openContextMenu("/root")
        await clickButtonOnPageElement(page, ".colorButton:nth-child(2)")
        await legendPanelObject.open()
        const emptyFilelist = await legendPanelObject.getEmptyLegendIfNoFilenamesExist()
        expect(emptyFilelist).toEqual("")
    })

    test("should highlight two different folders and add both to the legend then remove the first", async ({ page }) => {
        const { legendPanelObject, explorerTreeLevel } = await setupTest(page)

        await explorerTreeLevel.openContextMenu("/root/ParentLeaf")
        await clickButtonOnPageElement(page, ".colorButton:nth-child(1)")
        await legendPanelObject.open()
        const selectedFolders = await legendPanelObject.getMultipleFilenames()
        expect(selectedFolders[0]).toEqual("/root")
        expect(selectedFolders[1]).toEqual("/root/ParentLeaf")

        await explorerTreeLevel.openContextMenu("/root")
        await clickButtonOnPageElement(page, ".colorButton:nth-child(2)")
        await legendPanelObject.open()
        const selectedFolder = await legendPanelObject.getFilename()
        expect(selectedFolder).toMatch("/root/ParentLeaf")
    })
})
