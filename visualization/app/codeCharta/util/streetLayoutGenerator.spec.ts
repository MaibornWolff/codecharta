import { CodeMapNode, MetricData, Node, State } from "../codeCharta.model"
import { TEST_FILE_WITH_PATHS, STATE, VALID_NODE_WITH_PATH, METRIC_DATA } from "./dataMocks"
import { StreetLayoutGenerator } from "./streetLayoutGenerator"
import _ from "lodash"

describe("StreetLayoutGenerator", () => {
	let map: CodeMapNode
	let state: State
	let metricData: MetricData[]
	let codeMapNode: CodeMapNode

	beforeEach(() => {
		restartSystem()
	})

	function restartSystem() {
		map = _.cloneDeep(TEST_FILE_WITH_PATHS.map)
		state = _.cloneDeep(STATE)
		codeMapNode = _.cloneDeep(VALID_NODE_WITH_PATH)
		metricData = _.cloneDeep(METRIC_DATA)
	}

	describe("create street layout nodes", () => {
		it("only root node", () => {
			map.children = []

			let nodes: Node[] = StreetLayoutGenerator.createStreetLayoutNodes(map, state, metricData)

			expect(nodes).toMatchSnapshot()
		})

		it("root node with two direct children", () => {
			map.children[1].children = []

			let nodes: Node[] = StreetLayoutGenerator.createStreetLayoutNodes(map, state, metricData)

			expect(nodes).toMatchSnapshot()
		})

		it("root node with two direct children and some grand children", () => {
			let nodes: Node[] = StreetLayoutGenerator.createStreetLayoutNodes(map, state, metricData)

			expect(nodes).toMatchSnapshot()
		})
	})
})
