import { goto } from "../../../puppeteer.helper"
import { NodeContextMenuPageObject } from "./nodeContextMenu.po"
import { SearchPanelModeSelectorPageObject } from "../searchPanelModeSelector/searchPanelModeSelector.po"
import { MapTreeViewLevelPageObject } from "../mapTreeView/mapTreeView.level.po"
import { CodeMapPageObject } from "../codeMap/codeMap.po"

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

		const result = await contextMenu.hasColorButtons()
		expect(await result.isIntersectingViewport()).toBe(true)
	})

	it("clicking the map should close open node context menu", async () => {
		await searchPanelModeSelector.toggleTreeView()
		await mapTreeViewLevel.openContextMenu("/root")

		expect(await contextMenu.isOpened()).toBe(true)

		await codeMap.clickMap()
		expect(await contextMenu.isClosed()).toBe(true)
	})

	it("right clicking the map should close open node context menu already on mousedown", async () => {
		await searchPanelModeSelector.toggleTreeView()
		await mapTreeViewLevel.openContextMenu("/root")

		expect(await contextMenu.isOpened()).toBe(true)

		await codeMap.rightClickMouseDownOnMap()
		expect(await contextMenu.isClosed()).toBe(true)
	})

	it("zoom in and out or using mouse wheel on the map should close open node context menu", async () => {
		await searchPanelModeSelector.toggleTreeView()
		await mapTreeViewLevel.openContextMenu("/root")

		expect(await contextMenu.isOpened()).toBe(true)

		await codeMap.mouseWheelWithinMap()
		expect(await contextMenu.isClosed()).toBe(true)
	})
})
