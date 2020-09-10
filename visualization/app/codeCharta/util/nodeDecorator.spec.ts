import { hierarchy, HierarchyNode } from "d3"
import { DEFAULT_STATE, STATE, TEST_DELTA_MAP_A, VALID_NODE_WITH_PATH_AND_DELTAS } from "./dataMocks"
import { AttributeTypeValue, BlacklistItem, BlacklistType, CCFile, CodeMapNode, NodeType, State } from "../codeCharta.model"
import { NodeDecorator } from "./nodeDecorator"
import _ from "lodash"
import { NodeMetricDataService } from "../state/store/metricData/nodeMetricData/nodeMetricData.service"
import { FileSelectionState } from "../model/files/files"
import { clone } from "./clone"

describe("nodeDecorator", () => {
	let file: CCFile
	let map: CodeMapNode
	let deltaMap: CodeMapNode
	let state: State

	beforeEach(() => {
		file = clone(TEST_DELTA_MAP_A)
		map = file.map
		deltaMap = clone(VALID_NODE_WITH_PATH_AND_DELTAS)
		state = clone(DEFAULT_STATE)
		state.metricData.nodeMetricData = [
			{ name: "rloc", maxValue: 999999 },
			{ name: "functions", maxValue: 999999 },
			{
				name: "mcc",
				maxValue: 999999
			}
		]
		state.metricData.edgeMetricData = [
			{ name: "pairingRate", maxValue: 999 },
			{ name: "avgCommits", maxValue: 999 }
		]
		state.fileSettings.attributeTypes = {
			nodes: { functions: AttributeTypeValue.relative, rloc: AttributeTypeValue.absolute },
			edges: { pairingRate: AttributeTypeValue.relative }
		}
		state.fileSettings.blacklist = clone(STATE.fileSettings.blacklist)
		state.files = [{ selectedAs: FileSelectionState.Single, file }]
		NodeDecorator.decorateMapWithPathAttribute(file)
	})

	function allUniqueIds(map: HierarchyNode<CodeMapNode>): boolean {
		const ids = new Set()
		map.each(node => {
			if (ids.has(node.id)) {
				return false
			}
			ids.add(node.id)
		})
		return true
	}

	describe("decorateMap", () => {
		it("leaves should have all metrics", () => {
			state.metricData.nodeMetricData.push({ name: "some", maxValue: 999999 })
			NodeDecorator.decorateMap(map, state.metricData.nodeMetricData)

			hierarchy(map)
				.leaves()
				.forEach(node => {
					expect(node.data.attributes).toBeDefined()
					expect(node.data.attributes.some).toBe(0)
					expect(node.data.attributes.rloc).toBeDefined()
					expect(node.data.attributes.functions).toBeDefined()
					expect(node.data.attributes.mcc).toBeDefined()
				})
		})

		it("leaves should have all metrics even if some attributesLists are undefined", () => {
			map.children[0].attributes = undefined
			state.metricData.nodeMetricData.push({ name: "some", maxValue: 999999 })

			NodeDecorator.decorateMap(map, state.metricData.nodeMetricData)
			hierarchy(map)
				.leaves()
				.forEach(node => {
					expect(node.data.attributes).toBeDefined()
					expect(node.data.attributes.some).toBe(0)
					expect(node.data.attributes.rloc).toBeDefined()
					expect(node.data.attributes.functions).toBeDefined()
					expect(node.data.attributes.mcc).toBeDefined()
				})
		})

		it("should compact from root", () => {
			map.children = [
				{
					name: "middle",
					type: NodeType.FOLDER,
					attributes: {},
					isExcluded: false,
					isFlattened: false,
					children: [
						{
							name: "a",
							type: NodeType.FILE,
							attributes: {},
							isExcluded: false,
							isFlattened: false
						},
						{
							name: "b",
							type: NodeType.FILE,
							attributes: {},
							isExcluded: false,
							isFlattened: false
						}
					]
				}
			]
			NodeDecorator.decorateMapWithPathAttribute(file)
			NodeDecorator.decorateMap(map, state.metricData.nodeMetricData)
			expect(map.name).toBe("root/middle")
			expect(map.children.length).toBe(2)
			expect(map.children[0].name).toBe("a")
			expect(map.children[1].name).toBe("b")
		})

		it("should collect links correctly", () => {
			map.link = "link0"
			map.children = [
				{
					name: "middle",
					type: NodeType.FILE,
					attributes: {},
					link: "link1",
					isExcluded: false,
					isFlattened: false,
					children: [
						{
							name: "a",
							type: NodeType.FILE,
							attributes: {},
							isExcluded: false,
							isFlattened: false
						},
						{
							name: "b",
							type: NodeType.FILE,
							attributes: {},
							isExcluded: false,
							isFlattened: false
						}
					]
				}
			]
			NodeDecorator.decorateMapWithPathAttribute(file)
			NodeDecorator.decorateMap(map, state.metricData.nodeMetricData)
			expect(map.link).toBe("link1")
		})

		it("should collect paths correctly", () => {
			map.path = "/root"
			map.children = [
				{
					name: "middle",
					path: "/root/middle",
					type: NodeType.FOLDER,
					attributes: {},
					isExcluded: false,
					isFlattened: false,
					children: [
						{
							name: "a",
							type: NodeType.FILE,
							path: "/root/middle/a",
							attributes: {},
							isExcluded: false,
							isFlattened: false
						},
						{
							name: "b",
							type: NodeType.FILE,
							path: "/root/middle/b",
							attributes: {},
							isExcluded: false,
							isFlattened: false
						}
					]
				}
			]
			NodeDecorator.decorateMap(map, state.metricData.nodeMetricData)
			expect(map.path).toBe("/root/middle")
		})

		it("should not compact with single leaves", () => {
			map.children = [
				{
					name: "middle",
					type: NodeType.FOLDER,
					attributes: {},
					isExcluded: false,
					isFlattened: false,
					children: [
						{
							name: "singleLeaf",
							type: NodeType.FILE,
							attributes: {},
							isExcluded: false,
							isFlattened: false
						}
					]
				}
			]
			NodeDecorator.decorateMapWithPathAttribute(file)
			NodeDecorator.decorateMap(map, state.metricData.nodeMetricData)
			expect(map.name).toBe("root/middle")
			expect(map.children.length).toBe(1)
			expect(map.children[0].name).toBe("singleLeaf")
		})

		it("should compact intermediate middle packages", () => {
			map.children = [
				{
					name: "start",
					type: NodeType.FOLDER,
					attributes: {},
					isExcluded: false,
					isFlattened: false,
					children: [
						{
							name: "middle",
							type: NodeType.FOLDER,
							attributes: {},
							isExcluded: false,
							isFlattened: false,
							children: [
								{
									name: "middle2",
									type: NodeType.FOLDER,
									attributes: {},
									isExcluded: false,
									isFlattened: false,
									children: [
										{
											name: "a",
											type: NodeType.FILE,
											attributes: {},
											isExcluded: false,
											isFlattened: false
										},
										{
											name: "b",
											type: NodeType.FILE,
											attributes: {},
											isExcluded: false,
											isFlattened: false
										}
									]
								}
							]
						},
						{
							name: "c",
							type: NodeType.FILE,
							attributes: {},
							isExcluded: false,
							isFlattened: false
						}
					]
				}
			]
			NodeDecorator.decorateMapWithPathAttribute(file)
			NodeDecorator.decorateMap(map, state.metricData.nodeMetricData)
			expect(map.name).toBe("root/start")
			expect(map.children.length).toBe(2)
			expect(map.children[0].name).toBe("middle/middle2")
			expect(map.children[1].name).toBe("c")
			expect(map.children[0].children.length).toBe(2)
			expect(map.children[0].children[0].name).toBe("a")
			expect(map.children[0].children[1].name).toBe("b")
		})

		it("maps with no attribute nodes should be accepted and an attributes member added", () => {
			NodeDecorator.decorateMap(map, state.metricData.nodeMetricData)

			hierarchy(map).each(node => {
				expect(node.data.attributes[NodeMetricDataService.UNARY_METRIC]).toBeDefined()
			})
		})

		it("all nodes should have a unary attribute", () => {
			map.children[0].attributes = {}
			NodeDecorator.decorateMap(map, state.metricData.nodeMetricData)

			hierarchy(map).each(node => {
				expect(node.data.attributes[NodeMetricDataService.UNARY_METRIC]).toBeDefined()
			})
		})

		it("should decorate nodes with a unique id starting from 0", () => {
			NodeDecorator.decorateMap(file.map, [])

			const h = hierarchy(file.map)
			hierarchy(map).each(node => {
				expect(node.data.id).toBeDefined()
				expect(allUniqueIds(h)).toBeTruthy()
			})
			expect(file.map.id).toBe(0)
		})
	})

	describe("decorateMapWithPathAttribute", () => {
		it("should decorate nodes with the correct path", () => {
			NodeDecorator.decorateMapWithPathAttribute(file)

			hierarchy(file.map).each(node => {
				expect(node.data.path).toBeDefined()
			})

			expect(file.map.path).toBe("/root")
			expect(file.map.children[1].children[0].path).toBe("/root/Parent Leaf/small leaf")
		})
	})

	describe("decorateParentNodesWithAggregatedAttributes", () => {
		it("should aggregate given absolute metrics correctly", () => {
			NodeDecorator.decorateMap(map, state.metricData.nodeMetricData)
			NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, state)

			expect(map.attributes["rloc"]).toBe(200)
			expect(map.attributes["mcc"]).toBe(111)
		})

		it("should aggregate given relative metrics correctly", () => {
			NodeDecorator.decorateMap(map, state.metricData.nodeMetricData)
			NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, state)

			expect(map.attributes["functions"]).toBe(100)
		})

		it("should aggregate absolute edge metrics correctly", () => {
			map.children[0].edgeAttributes = { avgCommits: { incoming: 12, outgoing: 13 } }
			map.children[1].children[0].edgeAttributes = { avgCommits: { incoming: 10, outgoing: 10 } }
			NodeDecorator.decorateMap(map, state.metricData.nodeMetricData)

			NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, state)

			expect(map.edgeAttributes["avgCommits"].incoming).toBe(22)
			expect(map.edgeAttributes["avgCommits"].outgoing).toBe(23)
		})

		it("should aggregate given relative edge metrics correctly", () => {
			map.children[0].edgeAttributes = { pairingRate: { incoming: 12, outgoing: 13 } }
			map.children[1].children[0].edgeAttributes = { pairingRate: { incoming: 10, outgoing: 10 } }
			NodeDecorator.decorateMap(map, state.metricData.nodeMetricData)

			NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, state)

			expect(map.edgeAttributes["pairingRate"].incoming).toBe(11)
			expect(map.edgeAttributes["pairingRate"].outgoing).toBe(11.5)
		})

		it("should aggregate missing metrics correctly", () => {
			state.metricData.nodeMetricData.push({ name: "some", maxValue: 999999 })
			NodeDecorator.decorateMap(map, state.metricData.nodeMetricData)
			NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, state)

			expect(map.attributes["rloc"]).toBe(200)
			expect(map.attributes["some"]).toBe(0)
			expect(map.attributes["some other attribute"]).not.toBeDefined()
		})

		it("all nodes should have an attribute list with all possible metrics", () => {
			map.children[0].attributes = undefined
			map.children[1].attributes = { some: 1 }
			state.metricData.nodeMetricData.push({ name: "some", maxValue: 999999 })

			NodeDecorator.decorateMap(map, state.metricData.nodeMetricData)
			NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, state)

			hierarchy(map).each(node => {
				expect(node.data.attributes).toBeDefined()
				expect(node.data.attributes.some).toBeDefined()
			})
		})

		it("all nodes should have an attribute list with listed and available metrics", () => {
			NodeDecorator.decorateMap(map, state.metricData.nodeMetricData)
			NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, state)

			hierarchy(map).each(node => {
				expect(node.data.attributes).toBeDefined()
				expect(node.data.attributes["rloc"]).toBeDefined()
				expect(node.data.attributes["functions"]).toBeDefined()
			})
		})

		it("folders should have sum attributes of children for absolute metrics", () => {
			NodeDecorator.decorateMap(map, state.metricData.nodeMetricData)
			NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, state)

			const h = hierarchy(map)

			expect(h.data.attributes["rloc"]).toBe(200)
			expect(h.children[0].data.attributes["rloc"]).toBe(100)
		})

		it("folders should have median attributes of children for relative metrics", () => {
			NodeDecorator.decorateMap(map, state.metricData.nodeMetricData)
			NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, state)

			expect(hierarchy(map).data.attributes["functions"]).toBe(100)
		})

		it("folders should have sum delta values of children for absolute metrics", () => {
			state.files[0].selectedAs = FileSelectionState.Comparison
			NodeDecorator.decorateMap(deltaMap, state.metricData.nodeMetricData)
			NodeDecorator.decorateParentNodesWithAggregatedAttributes(deltaMap, state)

			const h = hierarchy(deltaMap)

			expect(h.data.deltas["rloc"]).toBe(295)
			expect(h.children[0].data.deltas["rloc"]).toBe(300)
			expect(h.children[2].data.deltas["rloc"]).toBe(145)
		})

		it("folders should have median delta values of children for relative metrics", () => {
			state.files[0].selectedAs = FileSelectionState.Comparison

			NodeDecorator.decorateMap(deltaMap, state.metricData.nodeMetricData)
			NodeDecorator.decorateParentNodesWithAggregatedAttributes(deltaMap, state)

			expect(hierarchy(deltaMap).data.deltas["functions"]).toBe(-3)
		})
	})

	describe("decorateMapWithBlacklist", () => {
		it("should update all flattened and excluded attributes on the map based on the blacklist", () => {
			state.fileSettings.blacklist.push({ path: "**/Parent Leaf", type: BlacklistType.flatten })

			NodeDecorator.decorateMapWithBlacklist(map, state.fileSettings.blacklist)

			expect(map).toMatchSnapshot()
		})

		it("should revert the map back to it's previous state, if all buildings will be excluded", () => {
			const item: BlacklistItem = { path: "*", type: BlacklistType.exclude }
			const oldMap = _.cloneDeep(map)

			try {
				NodeDecorator.decorateMapWithBlacklist(map, [item])
			} catch (e) {
				expect(e.message).toEqual("Excluding all buildings is not possible.")
				expect(map).toEqual(oldMap)
			}
		})
	})
})
