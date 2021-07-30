import { goto } from "../../../puppeteer.helper"
import { MapTreeViewLevelPageObject } from "./mapTreeView.level.po"
import { SearchPanelModeSelectorPageObject } from "../searchPanelModeSelector/searchPanelModeSelector.po"
import { NodeContextMenuPageObject } from "../nodeContextMenu/nodeContextMenu.po"
import pti from "puppeteer-to-istanbul"

//Commented out flaky test

describe("MapTreeViewLevel", () => {
	let mapTreeViewLevel: MapTreeViewLevelPageObject
	let searchPanelModeSelector: SearchPanelModeSelectorPageObject
	let nodeContextMenu: NodeContextMenuPageObject

	beforeEach(async () => {
		mapTreeViewLevel = new MapTreeViewLevelPageObject()
		searchPanelModeSelector = new SearchPanelModeSelectorPageObject()
		nodeContextMenu = new NodeContextMenuPageObject()
		await Promise.all([page.coverage.startJSCoverage(), page.coverage.startCSSCoverage()])

		await goto()
	})

	afterEach(async () => {
		const [jsCoverage, cssCoverage] = await Promise.all([page.coverage.stopJSCoverage(), page.coverage.stopCSSCoverage()])
		pti.write([...jsCoverage, ...cssCoverage], { includeHostname: true, storagePath: "./dist/e2eCoverage" })
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

	describe("NodeContextMenu", () => {
		it("NodeContextMenu path should remain marked when hovering over another mapTreeView Element", async () => {
			const filePath = "/root/ParentLeaf/smallLeaf.html"

			await searchPanelModeSelector.toggleTreeView()
			await mapTreeViewLevel.openFolder("/root/ParentLeaf")
			await mapTreeViewLevel.openContextMenu(filePath)
			await mapTreeViewLevel.hoverNode("/root/sample1OnlyLeaf.scss")

			expect(await mapTreeViewLevel.isNodeMarked(filePath)).toBeTruthy()
		})
	})
	/*
	describe("Number of Files", () => {
		it("should show the correct number of files in a folder", async () => {
			const folder = "/root/ParentLeaf"
			await searchPanelModeSelector.toggleTreeView()
			await mapTreeViewLevel.hoverNode(folder)

			expect(await mapTreeViewLevel.getNumberOfFiles(folder)).toBe(2)
		})
	})*/
})
