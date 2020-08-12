import * as d3 from "d3"
import { HierarchyNode } from "d3"
import { STATE, TEST_DELTA_MAP_A, VALID_NODE_WITH_PATH_AND_DELTAS } from "./dataMocks"
import {
	AttributeTypes,
	AttributeTypeValue,
	BlacklistItem,
	BlacklistType,
	CCFile,
	CodeMapNode,
	MetricData,
	NodeType
} from "../codeCharta.model"
import { NodeDecorator } from "./nodeDecorator"
import _ from "lodash"
import { MetricService } from "../state/metric.service"

describe("nodeDecorator", () => {
	let file: CCFile
	let map: CodeMapNode
	let deltaMap: CodeMapNode
	let metricData: MetricData[]
	let edgeMetricData: MetricData[]
	let blacklist: BlacklistItem[]
	let attributeTypes: AttributeTypes

	beforeEach(() => {
		file = _.cloneDeep(TEST_DELTA_MAP_A)
		map = file.map
		deltaMap = _.cloneDeep(VALID_NODE_WITH_PATH_AND_DELTAS)
		metricData = [
			{ name: "rloc", maxValue: 999999 },
			{ name: "functions", maxValue: 999999 },
			{
				name: "mcc",
				maxValue: 999999
			}
		]
		edgeMetricData = [
			{ name: "pairingRate", maxValue: 999 },
			{ name: "avgCommits", maxValue: 999 }
		]
		attributeTypes = {
			nodes: { functions: AttributeTypeValue.relative, rloc: AttributeTypeValue.absolute },
			edges: { pairingRate: AttributeTypeValue.relative }
		}
		blacklist = _.cloneDeep(STATE.fileSettings.blacklist)
		NodeDecorator.preDecorateFile(file)
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
			metricData.push({ name: "some", maxValue: 999999 })
			NodeDecorator.decorateMap(map, metricData)

			const h = d3.hierarchy(map)
			h.leaves().forEach(node => {
				expect(node.data.attributes).toBeDefined()
				expect(node.data.attributes.some).toBe(0)
				expect(node.data.attributes.rloc).toBeDefined()
				expect(node.data.attributes.functions).toBeDefined()
				expect(node.data.attributes.mcc).toBeDefined()
			})
		})

		it("leaves should have all metrics even if some attributesLists are undefined", () => {
			map.children[0].attributes = undefined
			metricData.push({ name: "some", maxValue: 999999 })

			NodeDecorator.decorateMap(map, metricData)
			const h = d3.hierarchy(map)
			h.leaves().forEach(node => {
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
			NodeDecorator.preDecorateFile(file)
			NodeDecorator.decorateMap(map, metricData)
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
			NodeDecorator.preDecorateFile(file)
			NodeDecorator.decorateMap(map, metricData)
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
			NodeDecorator.decorateMap(map, metricData)
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
			NodeDecorator.preDecorateFile(file)
			NodeDecorator.decorateMap(map, metricData)
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
			NodeDecorator.preDecorateFile(file)
			NodeDecorator.decorateMap(map, metricData)
			expect(map.name).toBe("root/start")
			expect(map.children.length).toBe(2)
			expect(map.children[0].name).toBe("middle/middle2")
			expect(map.children[1].name).toBe("c")
			expect(map.children[0].children.length).toBe(2)
			expect(map.children[0].children[0].name).toBe("a")
			expect(map.children[0].children[1].name).toBe("b")
		})

		it("maps with no attribute nodes should be accepted and an attributes member added", () => {
			NodeDecorator.decorateMap(map, metricData)

			const h = d3.hierarchy(map)

			h.each(node => {
				expect(node.data.attributes[MetricService.UNARY_METRIC]).toBeDefined()
			})
		})

		it("all nodes should have a unary attribute", () => {
			map.children[0].attributes = {}
			NodeDecorator.decorateMap(map, metricData)
			const h = d3.hierarchy(map)
			h.each(node => {
				expect(node.data.attributes[MetricService.UNARY_METRIC]).toBeDefined()
			})
		})
	})

	describe("decorateParentNodesWithAggregatedAttributes", () => {
		it("should aggregate given absolute metrics correctly", () => {
			NodeDecorator.decorateMap(map, metricData)
			NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, blacklist, metricData, [], false, attributeTypes)

			expect(map.attributes["rloc"]).toBe(200)
			expect(map.attributes["mcc"]).toBe(111)
		})

		it("should aggregate given relative metrics correctly", () => {
			NodeDecorator.decorateMap(map, metricData)
			NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, blacklist, metricData, [], false, attributeTypes)

			expect(map.attributes["functions"]).toBe(100)
		})

		it("should aggregate absolute edge metrics correctly", () => {
			map.children[0].edgeAttributes = { avgCommits: { incoming: 12, outgoing: 13 } }
			map.children[1].children[0].edgeAttributes = { avgCommits: { incoming: 10, outgoing: 10 } }
			NodeDecorator.decorateMap(map, metricData)

			NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, blacklist, metricData, edgeMetricData, false, attributeTypes)

			expect(map.edgeAttributes["avgCommits"].incoming).toBe(22)
			expect(map.edgeAttributes["avgCommits"].outgoing).toBe(23)
		})

		it("should aggregate given relative edge metrics correctly", () => {
			map.children[0].edgeAttributes = { pairingRate: { incoming: 12, outgoing: 13 } }
			map.children[1].children[0].edgeAttributes = { pairingRate: { incoming: 10, outgoing: 10 } }
			NodeDecorator.decorateMap(map, metricData)

			NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, blacklist, metricData, edgeMetricData, false, attributeTypes)

			expect(map.edgeAttributes["pairingRate"].incoming).toBe(11)
			expect(map.edgeAttributes["pairingRate"].outgoing).toBe(11.5)
		})

		it("should aggregate missing metrics correctly", () => {
			metricData.push({ name: "some", maxValue: 999999 })
			NodeDecorator.decorateMap(map, metricData)
			NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, blacklist, metricData, [], false, attributeTypes)

			expect(map.attributes["rloc"]).toBe(200)
			expect(map.attributes["some"]).toBe(0)
			expect(map.attributes["some other attribute"]).not.toBeDefined()
		})

		it("all nodes should have an attribute list with all possible metrics", () => {
			map.children[0].attributes = undefined
			map.children[1].attributes = { some: 1 }
			metricData.push({ name: "some", maxValue: 999999 })

			NodeDecorator.decorateMap(map, metricData)
			NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, blacklist, metricData, [], false, attributeTypes)
			const h = d3.hierarchy(map)
			h.each(node => {
				expect(node.data.attributes).toBeDefined()
				expect(node.data.attributes.some).toBeDefined()
			})
		})

		it("all nodes should have an attribute list with listed and available metrics", () => {
			NodeDecorator.decorateMap(map, metricData)
			NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, blacklist, metricData, [], false, attributeTypes)
			const h = d3.hierarchy(map)
			h.each(node => {
				expect(node.data.attributes).toBeDefined()
				expect(node.data.attributes["rloc"]).toBeDefined()
				expect(node.data.attributes["functions"]).toBeDefined()
			})
		})

		it("folders should have sum attributes of children for absolute metrics", () => {
			NodeDecorator.decorateMap(map, metricData)
			NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, blacklist, metricData, [], false, attributeTypes)
			const h = d3.hierarchy(map)
			expect(h.data.attributes["rloc"]).toBe(200)
			expect(h.children[0].data.attributes["rloc"]).toBe(100)
		})

		it("folders should have median attributes of children for relative metrics", () => {
			NodeDecorator.decorateMap(map, metricData)
			NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, blacklist, metricData, [], false, attributeTypes)
			const h = d3.hierarchy(map)
			expect(h.data.attributes["functions"]).toBe(100)
		})

		it("folders should have sum delta values of children for absolute metrics", () => {
			NodeDecorator.decorateMap(deltaMap, metricData)
			NodeDecorator.decorateParentNodesWithAggregatedAttributes(deltaMap, blacklist, metricData, [], true, attributeTypes)
			const h = d3.hierarchy(deltaMap)
			expect(h.data.deltas["rloc"]).toBe(295)
			expect(h.children[0].data.deltas["rloc"]).toBe(300)
			expect(h.children[2].data.deltas["rloc"]).toBe(145)
		})

		it("folders should have median delta values of children for relative metrics", () => {
			NodeDecorator.decorateMap(deltaMap, metricData)
			NodeDecorator.decorateParentNodesWithAggregatedAttributes(deltaMap, blacklist, metricData, [], true, attributeTypes)
			const h = d3.hierarchy(deltaMap)
			expect(h.data.deltas["functions"]).toBe(-3)
		})
	})

	describe("preDecorateFile", () => {
		it("should decorate nodes with the correct path", () => {
			NodeDecorator.preDecorateFile(file)

			const h = d3.hierarchy(file.map)
			h.each(node => {
				expect(node.data.path).toBeDefined()
			})

			expect(file.map.path).toBe("/root")
			expect(file.map.children[1].children[0].path).toBe("/root/Parent Leaf/small leaf")
		})

		it("should decorate nodes with a unique id starting from 0", () => {
			NodeDecorator.preDecorateFile(file)

			const h = d3.hierarchy(file.map)
			h.each(node => {
				expect(node.data.id).toBeDefined()
				expect(allUniqueIds(h)).toBeTruthy()
			})
			expect(file.map.id).toBe(0)
		})
	})

	describe("decorateMapWithBlacklist", () => {
		it("should update all flattened and excluded attributes on the map based on the blacklist", () => {
			blacklist.push({ path: "*", type: BlacklistType.exclude })
			blacklist.push({ path: "**/Parent Leaf", type: BlacklistType.flatten })

			NodeDecorator.decorateMapWithBlacklist(map, blacklist)

			expect(map).toMatchSnapshot()
		})
	})

	describe("doesExclusionResultInEmptyMap", () => {
		it("should return true, if all buildings match at least one pattern in the blacklist", () => {
			const item: BlacklistItem = { path: "*", type: BlacklistType.exclude }

			const result = NodeDecorator.doesExclusionResultInEmptyMap(map, [item])

			expect(result).toBeTruthy()
		})

		it("should return false, if at least one building does not match the patterns in the blacklist", () => {
			const result = NodeDecorator.doesExclusionResultInEmptyMap(map, blacklist)

			expect(result).toBeFalsy()
		})
	})
})
