import { TreeMapHelper } from "./treeMapHelper"
import { SquarifiedValuedCodeMapNode } from "./treeMapGenerator"
import { CodeMapNode, EdgeVisibility, Settings, BlacklistType } from "../codeCharta.model"
import { CODE_MAP_BUILDING, SETTINGS } from "./dataMocks"

describe("treeMapHelper", () => {
	describe("build node", () => {
		let codeMapNode: CodeMapNode
		let squaredNode: SquarifiedValuedCodeMapNode
		let settings

		let heightScale = 1
		let maxHeight = 2000
		let isDeltaState = false

		beforeEach(() => {
			codeMapNode = {
				name: "Anode",
				path: "/root/Anode",
				type: "File",
				attributes: { theHeight: 100 }
			} as CodeMapNode

			squaredNode = {
				data: codeMapNode,
				value: 42,
				x0: 0,
				y0: 0,
				x1: 400,
				y1: 400
			} as SquarifiedValuedCodeMapNode

			settings = SETTINGS
			settings.treeMapSettings.mapSize = 1
			settings.dynamicSettings.margin = 15
			settings.dynamicSettings.heightMetric = "theHeight"
			settings.appSettings.invertHeight = false
		})

		function buildNode() {
			return TreeMapHelper.buildNodeFrom(squaredNode, heightScale, maxHeight, settings, isDeltaState)
		}

		it("minimal", () => {
			expect(buildNode()).toMatchSnapshot()
		})

		it("invertHeight", () => {
			settings.appSettings.invertHeight = true
			expect(buildNode()).toMatchSnapshot()
		})

		it("deltas", () => {
			squaredNode.data.deltas = {}
			settings.dynamicSettings.heightMetric = "theHeight"
			squaredNode.data.deltas[settings.dynamicSettings.heightMetric] = 33
			expect(buildNode()).toMatchSnapshot()
			squaredNode.data.deltas = undefined
		})

		it("given negative deltas the resulting heightDelta also should be negative", () => {
			squaredNode.data.deltas = {}
			squaredNode.data.deltas[settings.dynamicSettings.heightMetric] = -33
			expect(buildNode().heightDelta).toBe(-33)
			squaredNode.data.deltas = undefined
		})

		it("should set lowest possible height caused by other visible edge pairs", () => {
			settings.fileSettings.edges = [
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
			settings.fileSettings.markedPackages = [
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
			settings.fileSettings.markedPackages = [
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

	describe("isNodeToBeFlat", () => {
		let codeMapNode: CodeMapNode
		let squaredNode: SquarifiedValuedCodeMapNode
		let treeMapSettings: Settings

		beforeEach(() => {
			codeMapNode = {
				name: "Anode",
				path: "/root/Anode",
				type: "File",
				attributes: {},
				edgeAttributes: { pairingRate: { incoming: 42, outgoing: 23 } }
			}

			squaredNode = {
				data: codeMapNode,
				value: 42,
				x0: 0,
				y0: 0,
				x1: 400,
				y1: 400
			} as SquarifiedValuedCodeMapNode

			treeMapSettings = SETTINGS
			treeMapSettings.treeMapSettings.mapSize = 1
			treeMapSettings.dynamicSettings.margin = 15
		})

		it("should not be a flat node when no visibleEdges", () => {
			treeMapSettings.fileSettings.edges = []
			expect(TreeMapHelper["isNodeToBeFlat"](squaredNode, treeMapSettings)).toBeFalsy()
		})

		it("should be a flat node when other edges are visible", () => {
			SETTINGS.appSettings.showOnlyBuildingsWithEdges = true
			treeMapSettings.fileSettings.edges = [
				{
					fromNodeName: "/root/anotherNode",
					toNodeName: "/root/anotherNode2",
					attributes: {},
					visible: EdgeVisibility.both
				}
			]
			expect(TreeMapHelper["isNodeToBeFlat"](squaredNode, treeMapSettings)).toBeTruthy()
		})

		it("should not be a flat node when it contains edges", () => {
			treeMapSettings.fileSettings.edges = [
				{
					fromNodeName: "/root/Anode",
					toNodeName: "/root/anotherNode",
					attributes: {}
				}
			]
			expect(TreeMapHelper["isNodeToBeFlat"](squaredNode, treeMapSettings)).toBeFalsy()
		})

		it("should not be a flat node, because its searched for", () => {
			treeMapSettings.dynamicSettings.searchedNodePaths = ["/root/Anode"]
			treeMapSettings.dynamicSettings.searchPattern = "Anode"
			expect(TreeMapHelper["isNodeToBeFlat"](squaredNode, treeMapSettings)).toBeFalsy()
		})

		it("should be a flat node, because other nodes are searched for", () => {
			treeMapSettings.dynamicSettings.searchedNodePaths = ["/root/anotherNode", "/root/anotherNode2"]
			treeMapSettings.dynamicSettings.searchPattern = "Anode"
			expect(TreeMapHelper["isNodeToBeFlat"](squaredNode, treeMapSettings)).toBeTruthy()
		})

		it("should not be a flat node when searchPattern is empty", () => {
			treeMapSettings.dynamicSettings.searchedNodePaths = ["/root/anotherNode", "/root/anotherNode2"]
			treeMapSettings.dynamicSettings.searchPattern = ""
			expect(TreeMapHelper["isNodeToBeFlat"](squaredNode, treeMapSettings)).toBeFalsy()
		})

		it("should be flat if node is flattened in blacklist", () => {
			treeMapSettings.fileSettings.blacklist = [{ path: "*Anode", type: BlacklistType.flatten }]

			expect(TreeMapHelper["isNodeToBeFlat"](squaredNode, treeMapSettings)).toBeTruthy()
		})

		it("should not be flat if node is not blacklisted", () => {
			treeMapSettings.fileSettings.blacklist = []

			expect(TreeMapHelper["isNodeToBeFlat"](squaredNode, treeMapSettings)).toBeFalsy()
		})
	})

	describe("getBuildingColor", () => {
		let node: CodeMapNode
		let settings: Settings

		beforeEach(() => {
			node = {
				name: "Anode",
				path: "/root/Anode",
				type: "File",
				attributes: {}
			} as CodeMapNode

			node.attributes = { validMetircName: 0 }

			settings = SETTINGS
			settings.appSettings.invertColorRange = false
			settings.appSettings.whiteColorBuildings = false
			settings.dynamicSettings.colorRange.from = 5
			settings.dynamicSettings.colorRange.to = 10
			settings.dynamicSettings.colorMetric = "validMetircName"
		})

		it("creates grey building for undefined colorMetric", () => {
			settings.dynamicSettings.colorMetric = "invalid"
			const buildingColor = TreeMapHelper["getBuildingColor"](node, settings, false, false)
			expect(buildingColor).toBe(settings.appSettings.mapColors.base)
		})

		it("creates flat colored building", () => {
			const flattend = true

			const buildingColor = TreeMapHelper["getBuildingColor"](node, settings, false, flattend)

			expect(buildingColor).toBe(settings.appSettings.mapColors.flat)
		})

		it("creates green colored building colorMetricValue < colorRangeFrom", () => {
			const buildingColor = TreeMapHelper["getBuildingColor"](node, settings, false, false)

			expect(buildingColor).toBe(settings.appSettings.mapColors.positive)
		})

		it("creates white colored building colorMetricValue < colorRangeFrom", () => {
			settings.appSettings.whiteColorBuildings = true

			const buildingColor = TreeMapHelper["getBuildingColor"](node, settings, false, false)

			expect(buildingColor).toBe(settings.appSettings.mapColors.lightGrey)
		})

		it("creates red colored building colorMetricValue < colorRangeFrom with inverted range", () => {
			settings.appSettings.invertColorRange = true

			const buildingColor = TreeMapHelper["getBuildingColor"](node, settings, false, false)

			expect(buildingColor).toBe(settings.appSettings.mapColors.negative)
		})

		it("creates red colored building colorMetricValue > colorRangeFrom", () => {
			node.attributes = { validMetircName: 12 }

			const buildingColor = TreeMapHelper["getBuildingColor"](node, settings, false, false)

			expect(buildingColor).toBe(settings.appSettings.mapColors.negative)
		})

		it("creates green colored building colorMetricValue > colorRangeFrom with inverted range", () => {
			settings.appSettings.invertColorRange = true
			node.attributes = { validMetircName: 12 }

			const buildingColor = TreeMapHelper["getBuildingColor"](node, settings, false, false)

			expect(buildingColor).toBe(settings.appSettings.mapColors.positive)
		})

		it("creates white colored building colorMetricValue > colorRangeFrom with inverted range", () => {
			settings.appSettings.invertColorRange = true
			settings.appSettings.whiteColorBuildings = true
			node.attributes = { validMetircName: 12 }

			const buildingColor = TreeMapHelper["getBuildingColor"](node, settings, false, false)

			expect(buildingColor).toBe(settings.appSettings.mapColors.lightGrey)
		})

		it("creates yellow colored building", () => {
			node.attributes = { validMetircName: 7 }
			const buildingColor = TreeMapHelper["getBuildingColor"](node, settings, false, false)
			expect(buildingColor).toBe(settings.appSettings.mapColors.neutral)
		})
	})

	describe("buildingArrayToMap", () => {
		it("should convert a array of buildings to a map", () => {
			const result = TreeMapHelper.buildingArrayToMap([CODE_MAP_BUILDING])

			expect(result.get(CODE_MAP_BUILDING.id)).toEqual(CODE_MAP_BUILDING)
		})
	})
})
