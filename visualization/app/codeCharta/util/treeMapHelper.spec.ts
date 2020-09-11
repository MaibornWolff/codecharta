import { TreeMapHelper } from "./treeMapHelper"
import { BlacklistType, CodeMapNode, EdgeVisibility, NodeType, State } from "../codeCharta.model"
import { CODE_MAP_BUILDING, STATE } from "./dataMocks"
import { HierarchyRectangularNode } from "d3"

describe("TreeMapHelper", () => {
	describe("build node", () => {
		let codeMapNode: CodeMapNode
		let squaredNode: HierarchyRectangularNode<CodeMapNode>
		let state: State

		const heightScale = 1
		const maxHeight = 2000
		const isDeltaState = false

		beforeEach(() => {
			codeMapNode = {
				name: "Anode",
				path: "/root/Anode",
				type: NodeType.FILE,
				attributes: { theHeight: 100 },
				isExcluded: false,
				isFlattened: false
			}

			squaredNode = {
				data: codeMapNode,
				value: 42,
				x0: 0,
				y0: 0,
				x1: 400,
				y1: 400
			} as HierarchyRectangularNode<CodeMapNode>

			state = STATE
			state.treeMap.mapSize = 1
			state.dynamicSettings.margin = 15
			state.dynamicSettings.heightMetric = "theHeight"
			state.appSettings.invertHeight = false
			state.dynamicSettings.focusedNodePath = ""
		})

		function buildNode() {
			return TreeMapHelper.buildNodeFrom(squaredNode, heightScale, maxHeight, state, isDeltaState)
		}

		it("minimal", () => {
			expect(buildNode()).toMatchSnapshot()
		})

		it("invertHeight", () => {
			state.appSettings.invertHeight = true
			expect(buildNode()).toMatchSnapshot()
		})

		it("deltas", () => {
			squaredNode.data.deltas = {}
			state.dynamicSettings.heightMetric = "theHeight"
			squaredNode.data.deltas[state.dynamicSettings.heightMetric] = 33
			expect(buildNode()).toMatchSnapshot()
			squaredNode.data.deltas = undefined
		})

		it("given negative deltas the resulting heightDelta also should be negative", () => {
			squaredNode.data.deltas = {}
			squaredNode.data.deltas[state.dynamicSettings.heightMetric] = -33
			expect(buildNode().heightDelta).toBe(-33)
			squaredNode.data.deltas = undefined
		})

		it("should set lowest possible height caused by other visible edge pairs", () => {
			state.fileSettings.edges = [
				{
					fromNodeName: "/root/AnotherNode1",
					toNodeName: "/root/AnotherNode2",
					attributes: {
						pairingRate: 33,
						avgCommits: 12
					},
					visible: EdgeVisibility.both
				}
			]
			expect(buildNode()).toMatchSnapshot()
		})

		it("should set markingColor according to markedPackages", () => {
			const color = "#FF0000"
			state.fileSettings.markedPackages = [
				{
					path: "/root/Anode",
					color
				}
			]
			expect(buildNode().markingColor).toEqual(color)
		})

		it("should set no markingColor according to markedPackages", () => {
			const color = "#FF0000"
			state.fileSettings.markedPackages = [
				{
					path: "/root/AnotherNode",
					color
				}
			]
			expect(buildNode().markingColor).toEqual(null)
		})

		it("should be visible if it's a children of the focused node path", () => {
			state.dynamicSettings.focusedNodePath = "/root"
			expect(buildNode().visible).toBeTruthy()
		})

		it("should not be visible if it's excluded", () => {
			codeMapNode.isExcluded = true
			expect(buildNode().visible).toBeFalsy()
		})

		it("should be visible if it's not excluded and no focused node path is given", () => {
			expect(buildNode().visible).toBeTruthy()
		})

		describe("isNodeToBeFlat", () => {
			beforeEach(() => {
				codeMapNode = {
					name: "Anode",
					path: "/root/Anode",
					type: NodeType.FILE,
					attributes: {},
					edgeAttributes: { pairingRate: { incoming: 42, outgoing: 23 } },
					isExcluded: false,
					isFlattened: false
				}

				squaredNode = {
					data: codeMapNode,
					value: 42,
					x0: 0,
					y0: 0,
					x1: 400,
					y1: 400
				} as HierarchyRectangularNode<CodeMapNode>

				state = STATE
				state.treeMap.mapSize = 1
				state.dynamicSettings.margin = 15
			})

			it("should not be a flat node when no visibleEdges", () => {
				state.fileSettings.edges = []
				expect(buildNode().flat).toBeFalsy()
			})

			it("should be a flat node when other edges are visible", () => {
				state.appSettings.showOnlyBuildingsWithEdges = true
				state.fileSettings.edges = [
					{
						fromNodeName: "/root/anotherNode",
						toNodeName: "/root/anotherNode2",
						attributes: {},
						visible: EdgeVisibility.both
					}
				]
				expect(buildNode().flat).toBeTruthy()
			})

			it("should not be a flat node when it contains edges", () => {
				state.fileSettings.edges = [
					{
						fromNodeName: "/root/Anode",
						toNodeName: "/root/anotherNode",
						attributes: {}
					}
				]
				expect(buildNode().flat).toBeFalsy()
			})

			it("should not be a flat node, because its searched for", () => {
				state.dynamicSettings.searchedNodePaths = new Set(["/root/Anode"])
				state.dynamicSettings.searchPattern = "Anode"
				expect(buildNode().flat).toBeFalsy()
			})

			it("should be a flat node, because other nodes are searched for", () => {
				state.dynamicSettings.searchedNodePaths = new Set(["/root/anotherNode", "/root/anotherNode2"])
				state.dynamicSettings.searchPattern = "Anode"
				expect(buildNode().flat).toBeTruthy()
			})

			it("should not be a flat node when searchPattern is empty", () => {
				state.dynamicSettings.searchedNodePaths = new Set(["/root/anotherNode", "/root/anotherNode2"])
				state.dynamicSettings.searchPattern = ""
				expect(buildNode().flat).toBeFalsy()
			})

			it("should be flat if node is flattened in blacklist", () => {
				state.fileSettings.blacklist = [{ path: "*Anode", type: BlacklistType.flatten }]
				squaredNode.data.isFlattened = true

				expect(buildNode().flat).toBeTruthy()
			})

			it("should not be flat if node is not blacklisted", () => {
				state.fileSettings.blacklist = []

				expect(buildNode().flat).toBeFalsy()
			})
		})

		describe("getBuildingColor", () => {
			let node: CodeMapNode
			let state: State

			beforeEach(() => {
				node = {
					name: "Anode",
					path: "/root/Anode",
					type: NodeType.FILE,
					attributes: {}
				} as CodeMapNode

				squaredNode.data = node

				node.attributes = { validMetricName: 0 }

				state = STATE
				state.appSettings.invertColorRange = false
				state.appSettings.whiteColorBuildings = false
				state.dynamicSettings.colorRange.from = 5
				state.dynamicSettings.colorRange.to = 10
				state.dynamicSettings.colorMetric = "validMetricName"
			})

			it("creates grey building for undefined colorMetric", () => {
				state.dynamicSettings.colorMetric = "invalid"
				expect(buildNode().color).toBe(state.appSettings.mapColors.base)
			})

			it("creates flat colored building", () => {
				state.fileSettings.blacklist = [{ path: "*Anode", type: BlacklistType.flatten }]
				squaredNode.data.isFlattened = true

				expect(buildNode().color).toBe(state.appSettings.mapColors.flat)
			})

			it("creates green colored building colorMetricValue < colorRangeFrom", () => {
				expect(buildNode().color).toBe(state.appSettings.mapColors.positive)
			})

			it("creates white colored building colorMetricValue < colorRangeFrom", () => {
				state.appSettings.whiteColorBuildings = true

				expect(buildNode().color).toBe(state.appSettings.mapColors.lightGrey)
			})

			it("creates red colored building colorMetricValue < colorRangeFrom with inverted range", () => {
				state.appSettings.invertColorRange = true

				expect(buildNode().color).toBe(state.appSettings.mapColors.negative)
			})

			it("creates red colored building colorMetricValue > colorRangeFrom", () => {
				node.attributes = { validMetricName: 12 }

				expect(buildNode().color).toBe(state.appSettings.mapColors.negative)
			})

			it("creates green colored building colorMetricValue > colorRangeFrom with inverted range", () => {
				state.appSettings.invertColorRange = true
				node.attributes = { validMetricName: 12 }

				expect(buildNode().color).toBe(state.appSettings.mapColors.positive)
			})

			it("creates white colored building colorMetricValue > colorRangeFrom with inverted range", () => {
				state.appSettings.invertColorRange = true
				state.appSettings.whiteColorBuildings = true
				node.attributes = { validMetricName: 12 }

				expect(buildNode().color).toBe(state.appSettings.mapColors.lightGrey)
			})

			it("creates yellow colored building", () => {
				node.attributes = { validMetricName: 7 }

				expect(buildNode().color).toBe(state.appSettings.mapColors.neutral)
			})
		})
	})

	describe("count nodes", () => {
		it("root only should be 1", () => {
			const root = {}
			expect(TreeMapHelper.countNodes(root)).toBe(1)
		})

		it("root plus child should be 2", () => {
			const root = { children: [{}] }
			expect(TreeMapHelper.countNodes(root)).toBe(2)
		})

		it("root plus child in child should be 3", () => {
			const root = { children: [{ children: [{}] }] }
			expect(TreeMapHelper.countNodes(root)).toBe(3)
		})

		it("root plus two children should be 3", () => {
			const root = { children: [{}, {}] }
			expect(TreeMapHelper.countNodes(root)).toBe(3)
		})
	})

	describe("buildingArrayToMap", () => {
		it("should convert a array of buildings to a map", () => {
			const result = TreeMapHelper.buildingArrayToMap([CODE_MAP_BUILDING])

			expect(result.get(CODE_MAP_BUILDING.id)).toEqual(CODE_MAP_BUILDING)
		})
	})
})
