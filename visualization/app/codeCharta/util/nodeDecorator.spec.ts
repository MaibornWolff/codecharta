import * as d3 from "d3"
import { STATE, TEST_DELTA_MAP_A, VALID_NODE_WITH_PATH_AND_DELTAS } from "./dataMocks"
import { CCFile, MetricData, BlacklistItem, CodeMapNode, FileMeta, NodeType } from "../codeCharta.model"
import { NodeDecorator } from "./nodeDecorator"
import { CodeMapHelper } from "./codeMapHelper"
import _ from "lodash"

describe("nodeDecorator", () => {
	let file: CCFile
	let map: CodeMapNode
	let deltaMap: CodeMapNode
	let fileMeta: FileMeta
	let metricData: MetricData[]
	let blacklist: BlacklistItem[]

	beforeEach(() => {
		file = _.cloneDeep(TEST_DELTA_MAP_A)
		map = _.cloneDeep(TEST_DELTA_MAP_A.map)
		deltaMap = _.cloneDeep(VALID_NODE_WITH_PATH_AND_DELTAS)
		fileMeta = _.cloneDeep(TEST_DELTA_MAP_A.fileMeta)
		metricData = [{ name: "rloc", maxValue: 999999 }, { name: "functions", maxValue: 999999 }, { name: "mcc", maxValue: 999999 }]
		blacklist = _.cloneDeep(STATE.fileSettings.blacklist)
	})

	describe("decorateMap", () => {
		beforeEach(() => {
			CodeMapHelper.isBlacklisted = jest.fn()
		})

		it("should aggregate given metrics correctly", () => {
			NodeDecorator.decorateMap(map, fileMeta, metricData)
			NodeDecorator.decorateParentNodesWithSumAttributes(map, blacklist, metricData, [], false)

			expect(map.attributes["rloc"]).toBe(200)
			expect(map.attributes["functions"]).toBe(1110)
			expect(map.attributes["mcc"]).toBe(111)
		})

		it("should aggregate missing metrics correctly", () => {
			metricData.push({ name: "some", maxValue: 999999 })
			NodeDecorator.decorateMap(map, fileMeta, metricData)
			NodeDecorator.decorateParentNodesWithSumAttributes(map, blacklist, metricData, [], false)

			expect(map.attributes["rloc"]).toBe(200)
			expect(map.attributes["some"]).toBe(0)
			expect(map.attributes["some other attribute"]).not.toBeDefined()
		})

		it("leaves should have all metrics", () => {
			metricData.push({ name: "some", maxValue: 999999 })
			NodeDecorator.decorateMap(map, fileMeta, metricData)

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

			NodeDecorator.decorateMap(map, fileMeta, metricData)
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
					children: [
						{
							name: "a",
							type: NodeType.FILE,
							attributes: {}
						},
						{
							name: "b",
							type: NodeType.FILE,
							attributes: {}
						}
					]
				}
			]
			NodeDecorator.decorateMap(map, fileMeta, metricData)
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
					children: [
						{
							name: "a",
							type: NodeType.FILE,
							attributes: {}
						},
						{
							name: "b",
							type: NodeType.FILE,
							attributes: {}
						}
					]
				}
			]
			NodeDecorator.decorateMap(map, fileMeta, metricData)
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
					children: [
						{
							name: "a",
							type: NodeType.FILE,
							path: "/root/middle/a",
							attributes: {}
						},
						{
							name: "b",
							type: NodeType.FILE,
							path: "/root/middle/b",
							attributes: {}
						}
					]
				}
			]
			NodeDecorator.decorateMap(map, fileMeta, metricData)
			expect(map.path).toBe("/root/middle")
		})

		it("should not compact with single leaves", () => {
			map.children = [
				{
					name: "middle",
					type: NodeType.FOLDER,
					attributes: {},
					children: [
						{
							name: "singleLeaf",
							type: NodeType.FILE,
							attributes: {}
						}
					]
				}
			]
			NodeDecorator.decorateMap(map, fileMeta, metricData)
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
					children: [
						{
							name: "middle",
							type: NodeType.FOLDER,
							attributes: {},
							children: [
								{
									name: "middle2",
									type: NodeType.FOLDER,
									attributes: {},
									children: [
										{
											name: "a",
											type: NodeType.FILE,
											attributes: {}
										},
										{
											name: "b",
											type: NodeType.FILE,
											attributes: {}
										}
									]
								}
							]
						},
						{
							name: "c",
							type: NodeType.FILE,
							attributes: {}
						}
					]
				}
			]
			NodeDecorator.decorateMap(map, fileMeta, metricData)
			expect(map.name).toBe("root/start")
			expect(map.children.length).toBe(2)
			expect(map.children[0].name).toBe("middle/middle2")
			expect(map.children[1].name).toBe("c")
			expect(map.children[0].children.length).toBe(2)
			expect(map.children[0].children[0].name).toBe("a")
			expect(map.children[0].children[1].name).toBe("b")
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
	})

	describe("decorateMap", () => {
		it("all nodes should have an attribute list with all possible metrics", () => {
			map.children[0].attributes = undefined
			map.children[1].attributes = { some: 1 }
			metricData.push({ name: "some", maxValue: 999999 })

			NodeDecorator.decorateMap(map, fileMeta, metricData)
			NodeDecorator.decorateParentNodesWithSumAttributes(map, blacklist, metricData, [], false)
			const h = d3.hierarchy(map)
			h.each(node => {
				expect(node.data.attributes).toBeDefined()
				expect(node.data.attributes.some).toBeDefined()
			})
		})

		it("all nodes should have an attribute list with listed and available metrics", () => {
			NodeDecorator.decorateMap(map, fileMeta, metricData)
			NodeDecorator.decorateParentNodesWithSumAttributes(map, blacklist, metricData, [], false)
			const h = d3.hierarchy(map)
			h.each(node => {
				expect(node.data.attributes).toBeDefined()
				expect(node.data.attributes["rloc"]).toBeDefined()
				expect(node.data.attributes["functions"]).toBeDefined()
			})
		})

		it("folders should have sum attributes of children", () => {
			NodeDecorator.decorateMap(map, fileMeta, metricData)
			NodeDecorator.decorateParentNodesWithSumAttributes(map, blacklist, metricData, [], false)
			const h = d3.hierarchy(map)
			expect(h.data.attributes["rloc"]).toBe(200)
			expect(h.children[0].data.attributes["rloc"]).toBe(100)
			expect(h.data.attributes["functions"]).toBe(1110)
		})

		it("folders should have sum delta values of children", () => {
			NodeDecorator.decorateMap(deltaMap, fileMeta, metricData)
			NodeDecorator.decorateParentNodesWithSumAttributes(deltaMap, blacklist, metricData, [], true)
			const h = d3.hierarchy(deltaMap)
			expect(h.data.deltas["rloc"]).toBe(295)
			expect(h.children[0].data.deltas["rloc"]).toBe(300)
			expect(h.children[2].data.deltas["rloc"]).toBe(145)
			expect(h.data.deltas["functions"]).toBe(5)
		})

		it("maps with no attribute nodes should be accepted and an attributes member added", () => {
			NodeDecorator.decorateMap(map, fileMeta, metricData)

			const h = d3.hierarchy(map)

			h.each(node => {
				expect(node.data.attributes["unary"]).toBeDefined()
			})
		})

		it("all nodes should have a unary attribute", () => {
			map.children[0].attributes = {}
			NodeDecorator.decorateMap(map, fileMeta, metricData)
			const h = d3.hierarchy(map)
			h.each(node => {
				expect(node.data.attributes["unary"]).toBeDefined()
			})
		})
	})
})
