import { clearIndexedDB, goto } from "../../../../../puppeteer.helper"
import { MapTreeViewLevelPageObject } from "./mapTreeView.level.po"
import { NodeContextMenuPageObject } from "../../../../state/effects/nodeContextMenu/nodeContextMenu.po"
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
        it("NodeContextMenu path should remain marked when hovering over another mapTreeView Element", async () => {
            const filePath = "/root/sample1.cc.json/ParentLeaf/smallLeaf.html"

            await searchPanel.toggle()
            await mapTreeViewLevel.openFolder("/root/sample1.cc.json")
            await mapTreeViewLevel.openFolder("/root/sample1.cc.json/ParentLeaf")
            await mapTreeViewLevel.openContextMenu(filePath)
            await mapTreeViewLevel.hoverNode("/root/sample1.cc.json/sample1OnlyLeaf.scss")

            expect(await mapTreeViewLevel.isNodeMarked(filePath)).toBeTruthy()
        })
    })
})
