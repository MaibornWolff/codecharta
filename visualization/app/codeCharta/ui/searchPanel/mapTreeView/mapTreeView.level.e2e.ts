import { clearIndexedDB, goto } from "../../../../puppeteer.helper"
import { MapTreeViewLevelPageObject } from "./mapTreeView.level.po"
import { SearchPanelModeSelectorPageObject } from "../searchPanelModeSelector/searchPanelModeSelector.po"
import { NodeContextMenuPageObject } from "../../../state/effects/nodeContextMenu/nodeContextMenu.po"

describe("MapTreeViewLevel", () => {
    let mapTreeViewLevel: MapTreeViewLevelPageObject
    let searchPanelModeSelector: SearchPanelModeSelectorPageObject
    let nodeContextMenu: NodeContextMenuPageObject

    beforeEach(async () => {
        mapTreeViewLevel = new MapTreeViewLevelPageObject()
        searchPanelModeSelector = new SearchPanelModeSelectorPageObject()
        nodeContextMenu = new NodeContextMenuPageObject()

        await goto()
    })

    afterEach(async () => {
        await clearIndexedDB()
    })

    describe("Blacklist", () => {
        it("excluding a building should exclude it from the tree-view as well", async () => {
            const filePath = "/root/sample1.cc.json/ParentLeaf/smallLeaf.html"

            await searchPanelModeSelector.toggleTreeView()
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

            await searchPanelModeSelector.toggleTreeView()
            await mapTreeViewLevel.openFolder("/root/sample1.cc.json")
            await mapTreeViewLevel.openFolder("/root/sample1.cc.json/ParentLeaf")
            await mapTreeViewLevel.openContextMenu(filePath)
            await mapTreeViewLevel.hoverNode("/root/sample1.cc.json/sample1OnlyLeaf.scss")

            expect(await mapTreeViewLevel.isNodeMarked(filePath)).toBeTruthy()
        })
    })
})
