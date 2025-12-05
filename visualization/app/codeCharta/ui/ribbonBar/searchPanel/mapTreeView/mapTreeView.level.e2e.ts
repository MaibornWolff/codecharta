import { clearIndexedDB, goto } from "../../../../../puppeteer.helper"
import { MapTreeViewLevelPageObject } from "./mapTreeView.level.po"
import { NodeContextMenuPageObject } from "../../../nodeContextMenu/nodeContextMenu.po"
import { SearchPanelPageObject } from "../searchPanel.po"

describe("MapTreeViewLevel", () => {
    let mapTreeViewLevel: MapTreeViewLevelPageObject
    let searchPanel: SearchPanelPageObject
    let nodeContextMenu: NodeContextMenuPageObject

    beforeEach(async () => {
        mapTreeViewLevel = new MapTreeViewLevelPageObject()
        searchPanel = new SearchPanelPageObject()
        nodeContextMenu = new NodeContextMenuPageObject()

        await goto()
    })

    afterEach(async () => {
        await clearIndexedDB()
    })

    describe("Blacklist", () => {
        it("excluding a building should exclude it from the tree-view as well", async () => {
            const filePath = "/root/sample1.cc.json/ParentLeaf/smallLeaf.html"

            await searchPanel.toggle()
            await mapTreeViewLevel.openFolder("/root/sample1.cc.json")
            await mapTreeViewLevel.openFolder("/root/sample1.cc.json/ParentLeaf")
            await mapTreeViewLevel.openContextMenu(filePath)
            await nodeContextMenu.exclude()

            expect(await mapTreeViewLevel.nodeExists(filePath)).toBeFalsy()
        })
    })

    describe("NodeContextMenu", () => {
        it("should keep node marked when hovering over another node while context menu is open", async () => {
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
