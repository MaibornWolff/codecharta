import { goto } from "../../../puppeteer.helper"
import { NodeContextMenuPageObject } from "./nodeContextMenu.po"
import { SearchPanelModeSelectorPageObject } from "../searchPanelModeSelector/searchPanelModeSelector.po"
import { MapTreeViewLevelPageObject } from "../mapTreeView/mapTreeView.level.po"

describe("NodeContextMenu", () => {
	let contextMenu: NodeContextMenuPageObject
	let searchPanelModeSelector: SearchPanelModeSelectorPageObject
	let mapTreeViewLevel: MapTreeViewLevelPageObject

	beforeEach(async () => {
		contextMenu = new NodeContextMenuPageObject()
		searchPanelModeSelector = new SearchPanelModeSelectorPageObject()
		mapTreeViewLevel = new MapTreeViewLevelPageObject()

		await goto()
	})

	it("right clicking a folder should open a context menu with color options", async () => {
		expect(await searchPanelModeSelector.toggleTreeView()).toBeTruthy()
		await mapTreeViewLevel.openContextMenu("/root")

		expect(await contextMenu.hasColorButtons()).toBeTruthy()
	})
})
