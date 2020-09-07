import { NodeMetricData, State } from "../codeCharta.model"
import { CodeMapNode, Node } from "../codeCharta.model"
import { TreeMapGenerator } from "./treeMapGenerator"
import { METRIC_DATA, TEST_FILE_WITH_PATHS, VALID_NODE_WITH_PATH, VALID_EDGES, STATE } from "./dataMocks"
import _ from "lodash"
import { NodeDecorator } from "./nodeDecorator"
import { fileWithFixedFolders } from "../ressources/fixed-folders/fixed-folders-example"
import { CodeChartaService } from "../codeCharta.service"

describe("treeMapGenerator", () => {
	let map: CodeMapNode
	let state: State
	let metricData: NodeMetricData[]
	let codeMapNode: CodeMapNode
	let isDeltaState

	beforeEach(() => {
		restartSystem()
	})

	function restartSystem() {
		map = _.cloneDeep(TEST_FILE_WITH_PATHS.map)
		NodeDecorator.decorateMapWithPathAttribute(CodeChartaService.getCCFile("someFile", fileWithFixedFolders))
		state = _.cloneDeep(STATE)
		codeMapNode = _.cloneDeep(VALID_NODE_WITH_PATH)
		metricData = _.cloneDeep(METRIC_DATA)
		isDeltaState = false
		state.dynamicSettings.focusedNodePath = ""
	}

	describe("create Treemap nodes", () => {
		it("only root node", () => {
			map.children = []

			const nodes: Node[] = TreeMapGenerator.createTreemapNodes(map, state, metricData, isDeltaState)

			expect(nodes).toMatchSnapshot()
		})

		it("root node with two direct children", () => {
			map.children[1].children = []

			const nodes: Node[] = TreeMapGenerator.createTreemapNodes(map, state, metricData, isDeltaState)

			expect(nodes).toMatchSnapshot()
		})

		it("root node with two direct children and some grand children", () => {
			const nodes: Node[] = TreeMapGenerator.createTreemapNodes(map, state, metricData, isDeltaState)

			expect(nodes).toMatchSnapshot()
		})

		it("should build the a tree map with valid coordinates using the fixed folder structure", () => {
			const nodes = TreeMapGenerator.createTreemapNodes(fileWithFixedFolders.nodes[0], state, metricData, isDeltaState)

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
			map.children[1].attributes = { myArea: 0, myHeight: 0 }
			map.children[1].deltas = { myArea: -40, myHeight: -80 }

			state.dynamicSettings.areaMetric = "myArea"
			state.dynamicSettings.heightMetric = "myHeight"
			state.treeMap.mapSize = 1000
			metricData = [
				{ name: "myArea", maxValue: 42 },
				{ name: "myHeight", maxValue: 99 }
			]

			const nodes: Node[] = TreeMapGenerator.createTreemapNodes(map, state, metricData, isDeltaState)

			expect(nodes[2].name).toBe("Parent Leaf")
			expect(nodes[2].width).toBeGreaterThan(0)
			expect(nodes[2].length).toBeGreaterThan(0)
		})

		it("attribute exists, no children", () => {
			map.children = []
			map.attributes = { a: 100 }

			const nodes: Node[] = TreeMapGenerator.createTreemapNodes(map, state, metricData, isDeltaState)

			expect(nodes[0].attributes["a"]).toBe(100)
		})

		it("attribute do not exists, no children", () => {
			map.children = []

			const nodes: Node[] = TreeMapGenerator.createTreemapNodes(map, state, metricData, isDeltaState)

			expect(nodes[0].attributes["b"]).toBe(undefined)
		})

		it("attribute do not exists, multiple children with non existant attributes", () => {
			state.dynamicSettings.heightMetric = "b"
			state.dynamicSettings.areaMetric = "b"
			metricData = [
				{ name: "a", maxValue: 42 },
				{ name: "b", maxValue: 99 }
			]

			const nodes: Node[] = TreeMapGenerator.createTreemapNodes(map, state, metricData, isDeltaState)

			expect(nodes[0].attributes["b"]).toBe(undefined)
		})

		it("area should be zero if metric does not exist", () => {
			state.dynamicSettings.areaMetric = "unknown"
			state.dynamicSettings.heightMetric = "unknown"
			state.fileSettings.edges = VALID_EDGES
			metricData = [{ name: "unknown", maxValue: 100 }]

			const nodes: Node[] = TreeMapGenerator.createTreemapNodes(map, state, metricData, isDeltaState)

			expect(nodes[2].width * nodes[2].length).toEqual(0)
		})
	})

	describe("calculateAreaValue", () => {
		it("should return 0 if node has children, not blacklisted and not only visible in comparison map", () => {
			const actual = TreeMapGenerator["calculateAreaValue"](codeMapNode, state)

			expect(actual).toBe(0)
		})
	})
})
