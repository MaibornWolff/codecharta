import { test, expect } from "@playwright/test"
import { clearIndexedDB, goto } from "../../../playwright.helper"
import { NodeContextMenuPageObject } from "./nodeContextMenu.po"
import { MapTreeViewLevelPageObject } from "../ribbonBar/searchPanel/mapTreeView/mapTreeView.level.po"
import { CodeMapPageObject } from "../codeMap/codeMap.po"
import { SearchPanelPageObject } from "../ribbonBar/searchPanel/searchPanel.po"

test.describe("NodeContextMenu", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test("right clicking a folder should open a context menu with color options", async ({ page }) => {
        const contextMenu = new NodeContextMenuPageObject(page)
        const searchPanel = new SearchPanelPageObject(page)
        const mapTreeViewLevel = new MapTreeViewLevelPageObject(page)

        await searchPanel.toggle()
        await mapTreeViewLevel.openContextMenu("/root")

        await contextMenu.hasColorButtons()
        await expect(page.locator(".colorButton").first()).toBeVisible()
    })

    test("clicking the map should close open node context menu", async ({ page }) => {
        const contextMenu = new NodeContextMenuPageObject(page)
        const searchPanel = new SearchPanelPageObject(page)
        const mapTreeViewLevel = new MapTreeViewLevelPageObject(page)
        const codeMap = new CodeMapPageObject(page)

        await searchPanel.toggle()
        await mapTreeViewLevel.openContextMenu("/root")

        await contextMenu.isOpened()

        await codeMap.clickMap()
        await contextMenu.isClosed()
    })

    test("right clicking the map should close open node context menu already on mousedown", async ({ page }) => {
        const contextMenu = new NodeContextMenuPageObject(page)
        const searchPanel = new SearchPanelPageObject(page)
        const mapTreeViewLevel = new MapTreeViewLevelPageObject(page)
        const codeMap = new CodeMapPageObject(page)

        await searchPanel.toggle()
        await mapTreeViewLevel.openContextMenu("/root")

        await contextMenu.isOpened()

        await codeMap.rightClickMouseDownOnMap()
        await contextMenu.isClosed()
    })

    test("zoom in and out or using mouse wheel on the map should close open node context menu", async ({ page }) => {
        const contextMenu = new NodeContextMenuPageObject(page)
        const searchPanel = new SearchPanelPageObject(page)
        const mapTreeViewLevel = new MapTreeViewLevelPageObject(page)
        const codeMap = new CodeMapPageObject(page)

        await searchPanel.toggle()
        await mapTreeViewLevel.openContextMenu("/root")

        await contextMenu.isOpened()

        await codeMap.mouseWheelWithinMap()
        await contextMenu.isClosed()
    })
})
