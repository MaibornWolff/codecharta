import { test, expect } from "@playwright/test"
import { clearIndexedDB, goto } from "../../../../../playwright.helper"
import { ExplorerTreeLevelPageObject } from "./explorerTreeLevel.po"
import { NodeContextMenuPageObject } from "../../../../ui/nodeContextMenu/nodeContextMenu.po"

test.describe("ExplorerTreeLevel", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test.describe("Blacklist", () => {
        test("excluding a building should exclude it from the tree-view as well", async ({ page }) => {
            const explorerTreeLevel = new ExplorerTreeLevelPageObject(page)
            const nodeContextMenu = new NodeContextMenuPageObject(page)

            const filePath = "/root/sample1.cc.json/ParentLeaf/smallLeaf.html"

            await explorerTreeLevel.openFolder("/root/sample1.cc.json")
            await explorerTreeLevel.openFolder("/root/sample1.cc.json/ParentLeaf")
            await explorerTreeLevel.openContextMenu(filePath)
            await nodeContextMenu.exclude()

            expect(await explorerTreeLevel.nodeExists(filePath)).toBeFalsy()
        })
    })

    test.describe("NodeContextMenu", () => {
        test("should keep node marked when hovering over another node while context menu is open", async ({ page }) => {
            const explorerTreeLevel = new ExplorerTreeLevelPageObject(page)

            // Arrange
            const markedNodePath = "/root/sample1.cc.json/bigLeaf.ts"
            const hoverNodePath = "/root/sample1.cc.json/sample1OnlyLeaf.scss"

            await explorerTreeLevel.openFolder("/root/sample1.cc.json")

            // Act
            await explorerTreeLevel.openContextMenu(markedNodePath)
            const markedBeforeHover = await explorerTreeLevel.hasMarkedClass(markedNodePath)
            await explorerTreeLevel.hoverNodeWithoutScrolling(hoverNodePath)

            // Assert
            const markedAfterHover = await explorerTreeLevel.hasMarkedClass(markedNodePath)
            expect(markedBeforeHover).toBe(true)
            expect(markedAfterHover).toBe(true)
        })
    })
})
