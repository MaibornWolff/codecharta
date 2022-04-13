import { goto } from "../../../puppeteer.helper"
import { EdgeChooserPageObject } from "./edgeChooser.po"
import { MapTreeViewLevelPageObject } from "../searchPanel/mapTreeView/mapTreeView.level.po"
import { SearchPanelPageObject } from "../searchPanel/searchPanel.po"
import { UploadFileButtonPageObject } from "../toolBar/uploadFilesButton/uploadFilesButton.po"

describe("MapTreeViewLevel", () => {
	let edgeChooser: EdgeChooserPageObject
	let uploadFilesButton: UploadFileButtonPageObject
	let mapTreeViewLevel: MapTreeViewLevelPageObject
	let searchPanel: SearchPanelPageObject

	beforeEach(async () => {
		edgeChooser = new EdgeChooserPageObject()
		uploadFilesButton = new UploadFileButtonPageObject()
		mapTreeViewLevel = new MapTreeViewLevelPageObject()
		searchPanel = new SearchPanelPageObject()

		await goto()
	})

	describe("EdgeChooser", () => {
		it("should update metrics correctly after switching to a map with different metrics", async () => {
			await uploadFilesButton.openFiles(["./app/codeCharta/resources/sample1_with_different_edges.cc.json"])
			await edgeChooser.open()
			const metrics = await edgeChooser.getMetrics()

			expect(metrics).toHaveLength(2)
		})
		//Flaky since node 16; disabled for now
		/*
		it("should display the amount of incoming and outgoing edges next to the metric name", async () => {
			await edgeChooser.selectEdgeMetric("pairingRate")
			await searchPanel.toggle()
			await mapTreeViewLevel.openFolder("/root/ParentLeaf")
			await mapTreeViewLevel.hoverNode("/root/ParentLeaf/smallLeaf.html")

			const edgeCount = await edgeChooser.getAmountOfEdges()

			expect(edgeCount).toEqual({ incoming: 2, outgoing: 0 })
		})
		*/

		it("should not display the amount of incoming and outgoing edges of buildings for the none metric", async () => {
			await searchPanel.toggle()
			await mapTreeViewLevel.openFolder("/root/sample1.cc.json")
			await mapTreeViewLevel.openFolder("/root/sample1.cc.json/ParentLeaf")
			await mapTreeViewLevel.hoverNode("/root/sample1.cc.json/ParentLeaf/smallLeaf.html")

			expect(await edgeChooser.isEdgeCountAvailable()).toBeFalsy()
		})
	})
})
