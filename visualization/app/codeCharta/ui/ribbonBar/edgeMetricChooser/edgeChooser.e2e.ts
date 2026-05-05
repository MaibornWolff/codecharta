import { test, expect } from "@playwright/test"
import { clearIndexedDB, goto } from "../../../../playwright.helper"
import { EdgeChooserPageObject } from "./edgeChooser.po"
import { ExplorerTreeLevelPageObject } from "../../../features/sidebarExplorer/components/explorerTreeLevel/explorerTreeLevel.po"
import { NavBarFolderButtonPageObject } from "../../../features/navBar/components/navBarFolderButton/navBarFolderButton.po"

test.describe("EdgeChooser", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test("should update metrics correctly after switching to a map with different metrics", async ({ page }) => {
        const edgeChooser = new EdgeChooserPageObject(page)
        const uploadFilesButton = new NavBarFolderButtonPageObject(page)

        await uploadFilesButton.openFiles(["./app/codeCharta/resources/sample1_with_different_edges.cc.json"])
        await edgeChooser.open()
        const metrics = await edgeChooser.getMetrics()

        expect(metrics).toHaveLength(2)
    })

    test("should not display the amount of incoming and outgoing edges of buildings for the none metric", async ({ page }) => {
        const edgeChooser = new EdgeChooserPageObject(page)
        const explorerTreeLevel = new ExplorerTreeLevelPageObject(page)

        await explorerTreeLevel.openFolder("/root/sample2.cc.json")
        await explorerTreeLevel.openFolder("/root/sample2.cc.json/ParentLeaf")
        await explorerTreeLevel.hoverNode("/root/sample2.cc.json/ParentLeaf/smallLeaf.html")

        expect(await edgeChooser.isEdgeCountAvailable()).toBeFalsy()
    })
})
