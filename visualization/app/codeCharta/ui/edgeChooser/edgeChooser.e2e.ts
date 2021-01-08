import { goto } from "../../../puppeteer.helper"
import { EdgeChooserPageObject } from "./edgeChooser.po"
import { FileChooserPageObject } from "../fileChooser/fileChooser.po"
import { MapTreeViewLevelPageObject } from "../mapTreeView/mapTreeView.level.po"
import { SearchPanelPageObject } from "../searchPanel/searchPanel.po"

describe("MapTreeViewLevel", () => {
	let edgeChooser: EdgeChooserPageObject
	let fileChooser: FileChooserPageObject
	let mapTreeViewLevel: MapTreeViewLevelPageObject
	let searchPanel: SearchPanelPageObject

	beforeAll(async () => {
		edgeChooser = new EdgeChooserPageObject()
		fileChooser = new FileChooserPageObject()
		mapTreeViewLevel = new MapTreeViewLevelPageObject()
		searchPanel = new SearchPanelPageObject()

		await goto()
	})

	describe("EdgeChooser", () => {
		it("should update metrics correctly after switching to a map with different metrics", async () => {
			await fileChooser.openFiles(["./app/codeCharta/ressources/sample1_with_different_edges.cc.json"])
			await edgeChooser.open()
			const metrics = await edgeChooser.getMetrics()

			expect(metrics).toHaveLength(2)

			// revert to initial state
			await edgeChooser.close()
			await fileChooser.openFiles(["./app/codeCharta/assets/sample1.cc.json"])
		})

		it("should display the amount of incoming and outgoing edges next to the metric name", async () => {
			
			await edgeChooser.selectEdgeMetric("pairingRate")
			await searchPanel.toggle()
			await mapTreeViewLevel.openFolder("/root/ParentLeaf")
			await mapTreeViewLevel.hoverNode("/root/ParentLeaf/smallLeaf.html")

			const edgeCount = await edgeChooser.getAmountOfEdges()
			expect(edgeCount).toEqual({ incoming: 2, outgoing: 0 })

			// revert to initial state
			await edgeChooser.selectEdgeMetric("None")
			await searchPanel.waitForClosed()
		})

		it("should not display the amount of incoming and outgoing edges of buildings for the none metric", async () => {
			await searchPanel.toggle()
			await mapTreeViewLevel.openFolder("/root/ParentLeaf")
			await mapTreeViewLevel.hoverNode("/root/ParentLeaf/smallLeaf.html")

			expect(await edgeChooser.isEdgeCountAvailable()).toBeFalsy()

			// revert to initial state
			await mapTreeViewLevel.closeFolder("/root/ParentLeaf")
			await searchPanel.toggle()
		})
	})
})
