import { Node } from "../rendering/node"
import { CCFile, Settings, MetricData } from "../../../codeCharta.model"
import { CodeMapNode } from "../../../codeCharta.model"
import { TreeMapService } from "./treemap.service"
import { SETTINGS, METRIC_DATA, TEST_FILE_WITH_PATHS, VALID_NODE_WITH_PATH, VALID_EDGES } from "../../../util/dataMocks"

describe("treemapService", () => {
	let renderFile: CCFile, settings: Settings, metricData: MetricData[], codemapNode: CodeMapNode

	beforeEach(() => {
		restartSystem()
	})

	function restartSystem() {
		renderFile = JSON.parse(JSON.stringify(TEST_FILE_WITH_PATHS))
		settings = JSON.parse(JSON.stringify(SETTINGS))
		codemapNode = JSON.parse(JSON.stringify(VALID_NODE_WITH_PATH))
		metricData = METRIC_DATA
	}

	describe("create Treemap nodes", () => {})

	it("only root node", () => {
		renderFile.map.children = []

		let node: Node = TreeMapService.createTreemapNodes(renderFile, settings, metricData)

		expect(node).toMatchSnapshot()
	})

	it("root node with two direct children", () => {
		renderFile.map.children[1].children = []

		let node: Node = TreeMapService.createTreemapNodes(renderFile, settings, metricData)

		expect(node).toMatchSnapshot()
	})

	it("root node with two direct children and some grand children", () => {
		let node: Node = TreeMapService.createTreemapNodes(renderFile, settings, metricData)

		expect(node).toMatchSnapshot()
	})

	describe("CodeMap value calculation", () => {
		it("if a node was deleted from previous revision it should still be visible and have positive width/length", () => {
			// given map with one node deleted in comparison to previous revision
			renderFile.map.attributes = { myArea: 22, myHeight: 12 }
			renderFile.map.deltas = {}
			renderFile.map.children[0].attributes = { myArea: 44, myHeight: 63 }
			renderFile.map.children[0].deltas = { myArea: 20, myHeight: 0 }
			renderFile.map.children[0].origin = "file.json"
			renderFile.map.children[1].attributes = { myArea: 0, myHeight: 0 }
			renderFile.map.children[1].deltas = { myArea: -40, myHeight: -80 }
			renderFile.map.children[1].origin = "notfile.json"

			renderFile.fileMeta.fileName = "file.json"
			settings.dynamicSettings.areaMetric = "myArea"
			settings.dynamicSettings.heightMetric = "myHeight"
			settings.treeMapSettings.mapSize = 1000
			metricData = [
				{ name: "myArea", maxValue: 42, availableInVisibleMaps: true },
				{ name: "myHeight", maxValue: 99, availableInVisibleMaps: true }
			]

			let node: Node = TreeMapService.createTreemapNodes(renderFile, settings, metricData)

			expect(node.children[1].name).toBe("Parent Leaf")
			expect(node.children[1].width).toBeGreaterThan(0)
			expect(node.children[1].length).toBeGreaterThan(0)
		})

		it("attribute exists, no children", () => {
			renderFile.map.children = []
			renderFile.map.attributes = { a: 100 }

			let node: Node = TreeMapService.createTreemapNodes(renderFile, settings, metricData)

			expect(node.attributes["a"]).toBe(100)
		})

		it("attribute do not exists, no children", () => {
			renderFile.map.children = []

			let node: Node = TreeMapService.createTreemapNodes(renderFile, settings, metricData)

			expect(node.attributes["b"]).toBe(undefined)
		})

		it("attribute do not exists, multiple children with non existant attributes", () => {
			settings.dynamicSettings.heightMetric = "b"
			settings.dynamicSettings.areaMetric = "b"
			metricData = [
				{ name: "a", maxValue: 42, availableInVisibleMaps: true },
				{ name: "b", maxValue: 99, availableInVisibleMaps: true }
			]

			let node: Node = TreeMapService.createTreemapNodes(renderFile, settings, metricData)

			expect(node.attributes["b"]).toBe(undefined)
		})

		it("filtered Edge Attributes are obtained, giving positive width and length", () => {
			settings.dynamicSettings.areaMetric = "pairingRate"
			settings.dynamicSettings.heightMetric = "pairingRate"
			settings.fileSettings.edges = VALID_EDGES
			metricData = [{ name: "pairingRate", maxValue: 100, availableInVisibleMaps: true }]

			let node: Node = TreeMapService.createTreemapNodes(renderFile, settings, metricData)

			expect(node.children[1].width).toBeGreaterThan(0)
			expect(node.children[1].length).toBeGreaterThan(0)
		})

		it("area should be zero if metric does not exist", () => {
			settings.dynamicSettings.areaMetric = "unknown"
			settings.dynamicSettings.heightMetric = "unknown"
			settings.fileSettings.edges = VALID_EDGES
			metricData = [{ name: "unknown", maxValue: 100, availableInVisibleMaps: true }]

			let node: Node = TreeMapService.createTreemapNodes(renderFile, settings, metricData)

			expect(node.children[1].width * node.children[1].length).toEqual(0)
		})
	})

	describe("setVisibilityOfNodeAndDescendants", () => {
		it("node visibility should be adjusted", () => {
			let result = TreeMapService.setVisibilityOfNodeAndDescendants(codemapNode, false)

			expect(result.visible).toBeFalsy()
		})

		it("node children visibility should be adjusted", () => {
			let result = TreeMapService.setVisibilityOfNodeAndDescendants(codemapNode, false)

			expect(result.children[0].visible).toBeFalsy()
			expect(result.children[1].visible).toBeFalsy()
		})
	})
})
