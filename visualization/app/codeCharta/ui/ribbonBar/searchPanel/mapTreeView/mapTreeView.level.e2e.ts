import { test, expect } from "@playwright/test"
import { clearIndexedDB, goto } from "../../../../../playwright.helper"
import { MapTreeViewLevelPageObject } from "./mapTreeView.level.po"
import { NodeContextMenuPageObject } from "../../../nodeContextMenu/nodeContextMenu.po"
import { SearchPanelPageObject } from "../searchPanel.po"

test.describe("MapTreeViewLevel", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test.describe("Blacklist", () => {
        test("excluding a building should exclude it from the tree-view as well", async ({ page }) => {
            const mapTreeViewLevel = new MapTreeViewLevelPageObject(page)
            const searchPanel = new SearchPanelPageObject(page)
            const nodeContextMenu = new NodeContextMenuPageObject(page)

            const filePath = "/root/sample1.cc.json/ParentLeaf/smallLeaf.html"

            await searchPanel.toggle()
            await mapTreeViewLevel.openFolder("/root/sample1.cc.json")
            await mapTreeViewLevel.openFolder("/root/sample1.cc.json/ParentLeaf")
            await mapTreeViewLevel.openContextMenu(filePath)
            await nodeContextMenu.exclude()

            expect(await mapTreeViewLevel.nodeExists(filePath)).toBeFalsy()
        })
    })

    test.describe("NodeContextMenu", () => {
        test("should keep node marked when hovering over another node while context menu is open", async ({ page }) => {
            const mapTreeViewLevel = new MapTreeViewLevelPageObject(page)
            const searchPanel = new SearchPanelPageObject(page)

            // Arrange
            const markedNodePath = "/root/sample1.cc.json/bigLeaf.ts"
            const hoverNodePath = "/root/sample1.cc.json/sample1OnlyLeaf.scss"

            await searchPanel.toggle()
            await mapTreeViewLevel.openFolder("/root/sample1.cc.json")

            // Act
            await mapTreeViewLevel.openContextMenu(markedNodePath)
            const markedBeforeHover = await mapTreeViewLevel.hasMarkedClass(markedNodePath)
            await mapTreeViewLevel.hoverNodeWithoutScrolling(hoverNodePath)

            // Assert
            const markedAfterHover = await mapTreeViewLevel.hasMarkedClass(markedNodePath)
            expect(markedBeforeHover).toBe(true)
            expect(markedAfterHover).toBe(true)
        })
    })
})
