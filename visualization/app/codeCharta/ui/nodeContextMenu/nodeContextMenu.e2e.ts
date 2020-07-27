import { goto } from "../../../puppeteer.helper"
import { NodeContextMenuPageObject } from "./nodeContextMenu.po"
import { SearchPanelModeSelectorPageObject } from "../searchPanelModeSelector/searchPanelModeSelector.po"
import { MapTreeViewLevelPageObject } from "../mapTreeView/mapTreeView.level.po"

describe("NodeContextMenu", () => {
	let contextMenu: NodeContextMenuPageObject
	let searchPanelModeSelector: SearchPanelModeSelectorPageObject
	let mapTreeViewLevel: MapTreeViewLevelPageObject

	beforeEach(async () => {
		await goto()

		contextMenu = new NodeContextMenuPageObject()
		searchPanelModeSelector = new SearchPanelModeSelectorPageObject()
		mapTreeViewLevel = new MapTreeViewLevelPageObject()
	})

	it("right clicking a folder should open a context menu with color options", async () => {
		await searchPanelModeSelector.toggleTreeView()
		await mapTreeViewLevel.openContextMenu("/root")

		expect(await contextMenu.hasColorButtons()).toBeTruthy()
	})
})
