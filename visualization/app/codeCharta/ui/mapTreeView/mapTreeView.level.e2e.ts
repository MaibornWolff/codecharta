import { goto } from "../../../puppeteer.helper"
import { MapTreeViewLevelPageObject } from "./mapTreeView.level.po"
import { SearchPanelModeSelectorPageObject } from "../searchPanelModeSelector/searchPanelModeSelector.po"
import { NodeContextMenuPageObject } from "../nodeContextMenu/nodeContextMenu.po"

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

	describe("Blacklist", () => {
		it("excluding a building should exclude it from the tree-view as well", async () => {
			const filePath = "/root/ParentLeaf/smallLeaf.html"

			const isOpen = await searchPanelModeSelector.toggleTreeView()
			expect(isOpen).toBeTruthy()

			await mapTreeViewLevel.openFolder("/root/ParentLeaf")
			await mapTreeViewLevel.openContextMenu(filePath)
			await nodeContextMenu.exclude()

			expect(await mapTreeViewLevel.nodeExists(filePath)).toBeFalsy()
		})
	})
})
