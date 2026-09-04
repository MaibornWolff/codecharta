import { expect, test } from "@playwright/test"
import { clearIndexedDB, goto } from "../../../../../playwright.helper"
import { ExplorerTreeLevelPageObject } from "../../../sidebarExplorer/components/explorerTreeLevel/explorerTreeLevel.po"
import { SidebarInspectorPageObject } from "./sidebarInspector.po"

test.describe("SidebarInspector", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test("should open when a building is selected and close via the close button", async ({ page }) => {
        const explorerTreeLevel = new ExplorerTreeLevelPageObject(page)
        const inspector = new SidebarInspectorPageObject(page)

        await inspector.waitUntilClosed()

        await explorerTreeLevel.openFolder("/root/sample1.cc.json")
        await explorerTreeLevel.selectNode("/root/sample1.cc.json/bigLeaf.ts")

        await inspector.waitUntilOpen()
        await expect(inspector.nodeName()).toHaveText("bigLeaf.ts")

        await inspector.close()
        await inspector.waitUntilClosed()
    })

    test("should close for a node the map drew no building for", async ({ page }) => {
        // Arrange — a folder has no building of its own, so the scene holds nothing to deselect.
        const explorerTreeLevel = new ExplorerTreeLevelPageObject(page)
        const inspector = new SidebarInspectorPageObject(page)
        await explorerTreeLevel.openFolder("/root/sample1.cc.json")
        await explorerTreeLevel.selectNode("/root/sample1.cc.json/ParentLeaf")
        await inspector.waitUntilOpen()

        // Act
        await inspector.close()

        // Assert
        await inspector.waitUntilClosed()
    })

    test("should reopen with the data of a newly selected building after closing manually", async ({ page }) => {
        const explorerTreeLevel = new ExplorerTreeLevelPageObject(page)
        const inspector = new SidebarInspectorPageObject(page)

        await explorerTreeLevel.openFolder("/root/sample1.cc.json")
        await explorerTreeLevel.selectNode("/root/sample1.cc.json/bigLeaf.ts")
        await inspector.waitUntilOpen()
        await inspector.close()
        await inspector.waitUntilClosed()

        await explorerTreeLevel.selectNode("/root/sample1.cc.json/sample1OnlyLeaf.scss")

        await inspector.waitUntilOpen()
        await expect(inspector.nodeName()).toHaveText("sample1OnlyLeaf.scss")
    })
})
