import { goto } from "../../../puppeteer.helper"
import { MapTreeViewLevelPageObject } from "./mapTreeView.level.po"
import { SearchPanelModeSelectorPageObject } from "../searchPanelModeSelector/searchPanelModeSelector.po"
import { NodeContextMenuPageObject } from "../nodeContextMenu/nodeContextMenu.po"

describe("MapTreeViewLevel", () => {
	let mapTreeViewLevel: MapTreeViewLevelPageObject
	let searchPanelModeSelector: SearchPanelModeSelectorPageObject
	let nodeContextMenu: NodeContextMenuPageObject

	beforeEach(async () => {
		await goto()

		mapTreeViewLevel = new MapTreeViewLevelPageObject(page)
		searchPanelModeSelector = new SearchPanelModeSelectorPageObject(page)
		nodeContextMenu = new NodeContextMenuPageObject(page)
	})

	describe("Blacklist", () => {
		it("excluding a building should exclude it from the tree-view as well", async () => {
			const filePath = "/root/ParentLeaf/smallLeaf.html"

			await searchPanelModeSelector.toggleTreeView()
			await mapTreeViewLevel.openFolder("/root/ParentLeaf")
			await mapTreeViewLevel.openContextMenu(filePath)
			await nodeContextMenu.exclude()

			expect(await mapTreeViewLevel.nodeExists(filePath)).toBeFalsy()
		})
	})
})
