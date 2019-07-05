import { Settings, MetricData } from "../codeCharta.model"
import { CodeMapNode, Node } from "../codeCharta.model"
import { TreeMapGenerator } from "./treeMapGenerator"
import { SETTINGS, METRIC_DATA, TEST_FILE_WITH_PATHS, VALID_NODE_WITH_PATH, VALID_EDGES } from "./dataMocks"

describe("treeMapGenerator", () => {
	let map: CodeMapNode, settings: Settings, metricData: MetricData[], codemapNode: CodeMapNode

	beforeEach(() => {
		restartSystem()
	})

	function restartSystem() {
		map = JSON.parse(JSON.stringify(TEST_FILE_WITH_PATHS.map))
		settings = JSON.parse(JSON.stringify(SETTINGS))
		codemapNode = JSON.parse(JSON.stringify(VALID_NODE_WITH_PATH))
		metricData = METRIC_DATA
	}

	describe("create Treemap nodes", () => {
		it("only root node", () => {
			map.children = []

			let nodes: Node[] = TreeMapGenerator.createTreemapNodes(map, settings, metricData)

			expect(nodes).toMatchSnapshot()
		})

		it("root node with two direct children", () => {
			map.children[1].children = []

			let nodes: Node[] = TreeMapGenerator.createTreemapNodes(map, settings, metricData)

			expect(nodes).toMatchSnapshot()
		})

		it("root node with two direct children and some grand children", () => {
			let nodes: Node[] = TreeMapGenerator.createTreemapNodes(map, settings, metricData)

			expect(nodes).toMatchSnapshot()
		})
	})

	describe("CodeMap value calculation", () => {
		it("if a node was deleted from previous file it should still be visible and have positive width/length", () => {
			// given map with one node deleted in comparison to previous file
			map.attributes = { myArea: 22, myHeight: 12 }
			map.deltas = {}
			map.children[0].attributes = { myArea: 44, myHeight: 63 }
			map.children[0].deltas = { myArea: 20, myHeight: 0 }
			map.children[0].origin = "file.json"
			map.children[1].attributes = { myArea: 0, myHeight: 0 }
			map.children[1].deltas = { myArea: -40, myHeight: -80 }
			map.children[1].origin = "notfile.json"

			settings.dynamicSettings.areaMetric = "myArea"
			settings.dynamicSettings.heightMetric = "myHeight"
			settings.treeMapSettings.mapSize = 1000
			metricData = [
				{ name: "myArea", maxValue: 42, availableInVisibleMaps: true },
				{ name: "myHeight", maxValue: 99, availableInVisibleMaps: true }
			]

			let nodes: Node[] = TreeMapGenerator.createTreemapNodes(map, settings, metricData)

			expect(nodes[2].name).toBe("Parent Leaf")
			expect(nodes[2].width).toBeGreaterThan(0)
			expect(nodes[2].length).toBeGreaterThan(0)
		})

		it("attribute exists, no children", () => {
			map.children = []
			map.attributes = { a: 100 }

			let nodes: Node[] = TreeMapGenerator.createTreemapNodes(map, settings, metricData)

			expect(nodes[0].attributes["a"]).toBe(100)
		})

		it("attribute do not exists, no children", () => {
			map.children = []

			let nodes: Node[] = TreeMapGenerator.createTreemapNodes(map, settings, metricData)

			expect(nodes[0].attributes["b"]).toBe(undefined)
		})

		it("attribute do not exists, multiple children with non existant attributes", () => {
			settings.dynamicSettings.heightMetric = "b"
			settings.dynamicSettings.areaMetric = "b"
			metricData = [
				{ name: "a", maxValue: 42, availableInVisibleMaps: true },
				{ name: "b", maxValue: 99, availableInVisibleMaps: true }
			]

			let nodes: Node[] = TreeMapGenerator.createTreemapNodes(map, settings, metricData)

			expect(nodes[0].attributes["b"]).toBe(undefined)
		})

		it("area should be zero if metric does not exist", () => {
			settings.dynamicSettings.areaMetric = "unknown"
			settings.dynamicSettings.heightMetric = "unknown"
			settings.fileSettings.edges = VALID_EDGES
			metricData = [{ name: "unknown", maxValue: 100, availableInVisibleMaps: true }]

			let nodes: Node[] = TreeMapGenerator.createTreemapNodes(map, settings, metricData)

			expect(nodes[2].width * nodes[2].length).toEqual(0)
		})
	})

	describe("setVisibilityOfNodeAndDescendants", () => {
		it("node visibility should be adjusted", () => {
			let result = TreeMapGenerator.setVisibilityOfNodeAndDescendants(codemapNode, false)

			expect(result.visible).toBeFalsy()
		})

		it("node children visibility should be adjusted", () => {
			let result = TreeMapGenerator.setVisibilityOfNodeAndDescendants(codemapNode, false)

			expect(result.children[0].visible).toBeFalsy()
			expect(result.children[1].visible).toBeFalsy()
		})
	})

	describe("calculateValue", () => {
		it("should return 0 if node has children, not blacklisted and not only visible in comparison map", () => {
			const actual = TreeMapGenerator["calculateValue"](codemapNode, settings)

			expect(actual).toBe(0)
		})
	})
})
