import { test, expect } from "@playwright/test"
import { clearIndexedDB, clickButtonOnPageElement, goto } from "../../../../../playwright.helper"
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
        await clickButtonOnPageElement(page, "[id='/root/sample1.cc.json/bigLeaf.ts']")

        await inspector.waitUntilOpen()
        expect(await inspector.getNodeName()).toContain("bigLeaf.ts")

        await inspector.close()
        await inspector.waitUntilClosed()
    })

    test("should reopen with the data of a newly selected building after closing manually", async ({ page }) => {
        const explorerTreeLevel = new ExplorerTreeLevelPageObject(page)
        const inspector = new SidebarInspectorPageObject(page)

        await explorerTreeLevel.openFolder("/root/sample1.cc.json")
        await clickButtonOnPageElement(page, "[id='/root/sample1.cc.json/bigLeaf.ts']")
        await inspector.waitUntilOpen()
        await inspector.close()
        await inspector.waitUntilClosed()

        await clickButtonOnPageElement(page, "[id='/root/sample1.cc.json/sample1OnlyLeaf.scss']")

        await inspector.waitUntilOpen()
        expect(await inspector.getNodeName()).toContain("sample1OnlyLeaf.scss")
    })
})
