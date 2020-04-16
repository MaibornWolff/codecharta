import { CodeMapNode, NodeType, State, EdgeVisibility, BlacklistType } from "../codeCharta.model"
import { LayoutNode, LayoutHelper } from "./layoutHelper"
import Rectangle from "./algorithm/rectangle"
import Point from "./algorithm/point"
import { STATE, CODE_MAP_BUILDING } from "./dataMocks"

describe("layoutHelper", () => {
	describe("build node", () => {
		let codeMapNode: CodeMapNode
		let layoutNode: LayoutNode
		let state

		let heightScale = 1
		let maxHeight = 2000
		let isDeltaState = false

		beforeEach(() => {
			codeMapNode = {
				name: "Anode",
				path: "/root/Anode",
				type: NodeType.FILE,
				attributes: { theHeight: 100 }
			} as CodeMapNode

			layoutNode = {
				data: codeMapNode,
				value: 42,
				rect: new Rectangle(new Point(0, 0), 400, 400),
				zOffset: 0
			}

			state = STATE
			state.treeMap.mapSize = 1
			state.dynamicSettings.margin = 15
			state.dynamicSettings.heightMetric = "theHeight"
			state.appSettings.invertHeight = false
		})

		function buildNode() {
			return LayoutHelper.buildNodeFrom(layoutNode, heightScale, maxHeight, state, isDeltaState)
		}

		it("minimal", () => {
			expect(buildNode()).toMatchSnapshot()
		})

		it("invertHeight", () => {
			state.appSettings.invertHeight = true
			expect(buildNode()).toMatchSnapshot()
		})

		it("deltas", () => {
			layoutNode.data.deltas = {}
			state.dynamicSettings.heightMetric = "theHeight"
			layoutNode.data.deltas[state.dynamicSettings.heightMetric] = 33
			expect(buildNode()).toMatchSnapshot()
			layoutNode.data.deltas = undefined
		})

		it("given negative deltas the resulting heightDelta also should be negative", () => {
			layoutNode.data.deltas = {}
			layoutNode.data.deltas[state.dynamicSettings.heightMetric] = -33
			expect(buildNode().heightDelta).toBe(-33)
			layoutNode.data.deltas = undefined
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
					visible: true
				}
			]
			expect(buildNode()).toMatchSnapshot()
		})

		it("should set markingColor according to markedPackages", () => {
			const color = "#FF0000"
			state.fileSettings.markedPackages = [
				{
					path: "/root/Anode",
					color: color,
					attributes: {}
				}
			]
			expect(buildNode().markingColor).toEqual(color)
		})

		it("should set no markingColor according to markedPackages", () => {
			const color = "#FF0000"
			state.fileSettings.markedPackages = [
				{
					path: "/root/AnotherNode",
					color: color,
					attributes: {}
				}
			]
			expect(buildNode().markingColor).toEqual(null)
		})
	})

	describe("count nodes", () => {
		it("root only should be 1", () => {
			const root = {}
			expect(LayoutHelper.countNodes(root)).toBe(1)
		})

		it("root plus child should be 2", () => {
			const root = { children: [{}] }
			expect(LayoutHelper.countNodes(root)).toBe(2)
		})

		it("root plus child in child should be 3", () => {
			const root = { children: [{ children: [{}] }] }
			expect(LayoutHelper.countNodes(root)).toBe(3)
		})

		it("root plus two children should be 3", () => {
			const root = { children: [{}, {}] }
			expect(LayoutHelper.countNodes(root)).toBe(3)
		})
	})

	describe("isNodeToBeFlat", () => {
		let codeMapNode: CodeMapNode
		let layoutNode: LayoutNode
		let state: State

		beforeEach(() => {
			codeMapNode = {
				name: "Anode",
				path: "/root/Anode",
				type: NodeType.FILE,
				attributes: {},
				edgeAttributes: { pairingRate: { incoming: 42, outgoing: 23 } }
			}

			layoutNode = {
				data: codeMapNode,
				value: 42,
				rect: new Rectangle(new Point(0, 0), 400, 400),
				zOffset: 0
			}

			state = STATE
			state.treeMap.mapSize = 1
			state.dynamicSettings.margin = 15
		})

		it("should not be a flat node when no visibleEdges", () => {
			state.fileSettings.edges = []
			expect(LayoutHelper["isNodeToBeFlat"](layoutNode, state)).toBeFalsy()
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
			expect(LayoutHelper["isNodeToBeFlat"](layoutNode, state)).toBeTruthy()
		})

		it("should not be a flat node when it contains edges", () => {
			state.fileSettings.edges = [
				{
					fromNodeName: "/root/Anode",
					toNodeName: "/root/anotherNode",
					attributes: {}
				}
			]
			expect(LayoutHelper["isNodeToBeFlat"](layoutNode, state)).toBeFalsy()
		})

		it("should not be a flat node, because its searched for", () => {
			state.dynamicSettings.searchedNodePaths = ["/root/Anode"]
			state.dynamicSettings.searchPattern = "Anode"
			expect(LayoutHelper["isNodeToBeFlat"](layoutNode, state)).toBeFalsy()
		})

		it("should be a flat node, because other nodes are searched for", () => {
			state.dynamicSettings.searchedNodePaths = ["/root/anotherNode", "/root/anotherNode2"]
			state.dynamicSettings.searchPattern = "Anode"
			expect(LayoutHelper["isNodeToBeFlat"](layoutNode, state)).toBeTruthy()
		})

		it("should not be a flat node when searchPattern is empty", () => {
			state.dynamicSettings.searchedNodePaths = ["/root/anotherNode", "/root/anotherNode2"]
			state.dynamicSettings.searchPattern = ""
			expect(LayoutHelper["isNodeToBeFlat"](layoutNode, state)).toBeFalsy()
		})

		it("should be flat if node is flattened in blacklist", () => {
			state.fileSettings.blacklist = [{ path: "*Anode", type: BlacklistType.flatten }]

			expect(LayoutHelper["isNodeToBeFlat"](layoutNode, state)).toBeTruthy()
		})

		it("should not be flat if node is not blacklisted", () => {
			state.fileSettings.blacklist = []

			expect(LayoutHelper["isNodeToBeFlat"](layoutNode, state)).toBeFalsy()
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

			node.attributes = { validMetircName: 0 }

			state = STATE
			state.appSettings.invertColorRange = false
			state.appSettings.whiteColorBuildings = false
			state.dynamicSettings.colorRange.from = 5
			state.dynamicSettings.colorRange.to = 10
			state.dynamicSettings.colorMetric = "validMetircName"
		})

		it("creates grey building for undefined colorMetric", () => {
			state.dynamicSettings.colorMetric = "invalid"
			const buildingColor = LayoutHelper["getBuildingColor"](node, state, false, false)
			expect(buildingColor).toBe(state.appSettings.mapColors.base)
		})

		it("creates flat colored building", () => {
			const flattend = true

			const buildingColor = LayoutHelper["getBuildingColor"](node, state, false, flattend)

			expect(buildingColor).toBe(state.appSettings.mapColors.flat)
		})

		it("creates green colored building colorMetricValue < colorRangeFrom", () => {
			const buildingColor = LayoutHelper["getBuildingColor"](node, state, false, false)

			expect(buildingColor).toBe(state.appSettings.mapColors.positive)
		})

		it("creates white colored building colorMetricValue < colorRangeFrom", () => {
			state.appSettings.whiteColorBuildings = true

			const buildingColor = LayoutHelper["getBuildingColor"](node, state, false, false)

			expect(buildingColor).toBe(state.appSettings.mapColors.lightGrey)
		})

		it("creates red colored building colorMetricValue < colorRangeFrom with inverted range", () => {
			state.appSettings.invertColorRange = true

			const buildingColor = LayoutHelper["getBuildingColor"](node, state, false, false)

			expect(buildingColor).toBe(state.appSettings.mapColors.negative)
		})

		it("creates red colored building colorMetricValue > colorRangeFrom", () => {
			node.attributes = { validMetircName: 12 }

			const buildingColor = LayoutHelper["getBuildingColor"](node, state, false, false)

			expect(buildingColor).toBe(state.appSettings.mapColors.negative)
		})

		it("creates green colored building colorMetricValue > colorRangeFrom with inverted range", () => {
			state.appSettings.invertColorRange = true
			node.attributes = { validMetircName: 12 }

			const buildingColor = LayoutHelper["getBuildingColor"](node, state, false, false)

			expect(buildingColor).toBe(state.appSettings.mapColors.positive)
		})

		it("creates white colored building colorMetricValue > colorRangeFrom with inverted range", () => {
			state.appSettings.invertColorRange = true
			state.appSettings.whiteColorBuildings = true
			node.attributes = { validMetircName: 12 }

			const buildingColor = LayoutHelper["getBuildingColor"](node, state, false, false)

			expect(buildingColor).toBe(state.appSettings.mapColors.lightGrey)
		})

		it("creates yellow colored building", () => {
			node.attributes = { validMetircName: 7 }
			const buildingColor = LayoutHelper["getBuildingColor"](node, state, false, false)
			expect(buildingColor).toBe(state.appSettings.mapColors.neutral)
		})
	})

	describe("buildingArrayToMap", () => {
		it("should convert a array of buildings to a map", () => {
			const result = LayoutHelper.buildingArrayToMap([CODE_MAP_BUILDING])

			expect(result.get(CODE_MAP_BUILDING.id)).toEqual(CODE_MAP_BUILDING)
		})
	})

	describe("isNodeLeaf", () => {
		let innerNode: CodeMapNode
		let leafNode: CodeMapNode

		beforeEach(() => {
			leafNode = {
				name: "Anode",
				path: "/root/Anode",
				type: NodeType.FILE,
				attributes: {},
				edgeAttributes: { pairingRate: { incoming: 42, outgoing: 23 } }
			} as CodeMapNode

			innerNode = {
				name: "root",
				path: "/root",
				type: NodeType.FOLDER,
				attributes: {},
				children: [leafNode],
				edgeAttributes: { pairingRate: { incoming: 42, outgoing: 23 } }
			}

			it("should be leaf", () => {
				const isFile = LayoutHelper.isNodeLeaf(leafNode)
				expect(isFile).toBe(true)
			})

			it("should not be leaf", () => {
				const isFile = LayoutHelper.isNodeLeaf(innerNode)
				expect(isFile).toBe(false)
			})
		})
	})

	describe("calculateSize", () => {
		let innerNode: CodeMapNode
		let leafNode: CodeMapNode

		beforeEach(() => {
			leafNode = {
				name: "Anode",
				path: "/root/Anode",
				type: NodeType.FILE,
				attributes: { rloc: 100 },
				edgeAttributes: { pairingRate: { incoming: 42, outgoing: 23 } }
			} as CodeMapNode

			innerNode = {
				name: "root",
				path: "/root",
				type: NodeType.FOLDER,
				attributes: {},
				children: [leafNode, leafNode],
				edgeAttributes: { pairingRate: { incoming: 42, outgoing: 23 } }
			} as CodeMapNode

			it("should be the node's attribute", () => {
				const size = LayoutHelper.calculateSize(leafNode, "rloc")
				expect(size).toBe(leafNode.attributes["rloc"])
			})

			it("should be the sum of all its childrens' summed attributes", () => {
				const isFile = LayoutHelper.isNodeLeaf(innerNode)
				expect(isFile).toBe(leafNode.children.reduce((a, b) => a + b.attributes["rloc"], 0))
			})
		})
	})

	describe("mergeDirectories", () => {
		let innerNode: CodeMapNode
		let leafNode: CodeMapNode

		beforeEach(() => {
			leafNode = {
				name: "Anode",
				path: "/root/Anode",
				type: NodeType.FILE,
				attributes: { rloc: 100 },
				edgeAttributes: { pairingRate: { incoming: 42, outgoing: 23 } }
			} as CodeMapNode

			innerNode = {
				name: "root",
				path: "/root",
				type: NodeType.FOLDER,
				attributes: {},
				children: [leafNode],
				edgeAttributes: { pairingRate: { incoming: 42, outgoing: 23 } }
			} as CodeMapNode

			it("should be merged directory names", () => {
				const node = LayoutHelper.mergeDirectories(innerNode, "rloc")
				expect(node.name).toBe(innerNode.name + "/" + leafNode.name)
			})

			it("should not be merged names", () => {
				const node = LayoutHelper.mergeDirectories(innerNode, "rloc")
				expect(node.name).toBe(innerNode.name)
			})
		})
	})
})
