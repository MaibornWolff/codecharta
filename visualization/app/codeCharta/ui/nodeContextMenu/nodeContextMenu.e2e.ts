import { goto } from "../../../puppeteer.helper"
import { NodeContextMenuPageObject } from "./nodeContextMenu.po"
import { SearchPanelModeSelectorPageObject } from "../searchPanelModeSelector/searchPanelModeSelector.po"
import { MapTreeViewLevelPageObject } from "../mapTreeView/mapTreeView.level.po"
import { CodeMapPageObject } from "../codeMap/codeMap.po";

describe("NodeContextMenu", () => {
	let contextMenu: NodeContextMenuPageObject
	let searchPanelModeSelector: SearchPanelModeSelectorPageObject
	let mapTreeViewLevel: MapTreeViewLevelPageObject
	let codeMap: CodeMapPageObject

	beforeEach(async () => {
		contextMenu = new NodeContextMenuPageObject()
		searchPanelModeSelector = new SearchPanelModeSelectorPageObject()
		mapTreeViewLevel = new MapTreeViewLevelPageObject()
        codeMap = new CodeMapPageObject()

		await goto()
	})

	it("right clicking a folder should open a context menu with color options", async () => {
		await searchPanelModeSelector.toggleTreeView()
		await mapTreeViewLevel.openContextMenu("/root")

		expect(await contextMenu.hasColorButtons()).toBeTruthy()
	})

	it("right clicking the map should close open node options menu", async () => {
		await searchPanelModeSelector.toggleTreeView()
		await mapTreeViewLevel.openContextMenu("/root")
		await codeMap.rightClickMap()

		expect(await contextMenu.isClosed()).toBeTruthy()
	})
})
