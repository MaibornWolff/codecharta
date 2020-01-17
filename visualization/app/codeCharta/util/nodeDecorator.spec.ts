import * as d3 from "d3"
import { STATE, TEST_DELTA_MAP_A, VALID_NODE_WITH_PATH_AND_DELTAS } from "./dataMocks"
import { CCFile, MetricData, BlacklistItem, CodeMapNode, FileMeta } from "../codeCharta.model"
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
		metricData = [
			{ name: "rloc", maxValue: 999999, availableInVisibleMaps: true },
			{ name: "functions", maxValue: 999999, availableInVisibleMaps: true },
			{ name: "mcc", maxValue: 999999, availableInVisibleMaps: true }
		]
		blacklist = _.cloneDeep(STATE.fileSettings.blacklist)
	})

	describe("decorateMap", () => {
		beforeEach(() => {
			CodeMapHelper.isBlacklisted = jest.fn()
		})

		it("should aggregate given metrics correctly", () => {
			let result = NodeDecorator.decorateMap(map, fileMeta, metricData)
			result = NodeDecorator.decorateParentNodesWithSumAttributes(result, blacklist, metricData, [], false)

			expect(result.attributes["rloc"]).toBe(200)
			expect(result.attributes["functions"]).toBe(1110)
			expect(result.attributes["mcc"]).toBe(111)
		})

		it("should aggregate missing metrics correctly", () => {
			metricData.push({ name: "some", maxValue: 999999, availableInVisibleMaps: true })
			let result = NodeDecorator.decorateMap(map, fileMeta, metricData)
			result = NodeDecorator.decorateParentNodesWithSumAttributes(result, blacklist, metricData, [], false)

			expect(result.attributes["rloc"]).toBe(200)
			expect(result.attributes["some"]).toBe(0)
			expect(result.attributes["some other attribute"]).not.toBeDefined()
		})

		it("leaves should have all metrics", () => {
			metricData.push({ name: "some", maxValue: 999999, availableInVisibleMaps: true })
			const result = NodeDecorator.decorateMap(map, fileMeta, metricData)

			let h = d3.hierarchy(result)
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
			metricData.push({ name: "some", maxValue: 999999, availableInVisibleMaps: true })

			const result = NodeDecorator.decorateMap(map, fileMeta, metricData)
			let h = d3.hierarchy(result)
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
					type: "Folder",
					attributes: {},
					children: [
						{
							name: "a",
							type: "File",
							attributes: {}
						},
						{
							name: "b",
							type: "File",
							attributes: {}
						}
					]
				}
			]
			const result = NodeDecorator.decorateMap(map, fileMeta, metricData)
			expect(result.name).toBe("root/middle")
			expect(result.children.length).toBe(2)
			expect(result.children[0].name).toBe("a")
			expect(result.children[1].name).toBe("b")
		})

		it("should collect links correctly", () => {
			map.link = "link0"
			map.children = [
				{
					name: "middle",
					type: "File",
					attributes: {},
					link: "link1",
					children: [
						{
							name: "a",
							type: "File",
							attributes: {}
						},
						{
							name: "b",
							type: "File",
							attributes: {}
						}
					]
				}
			]
			const result = NodeDecorator.decorateMap(map, fileMeta, metricData)
			expect(result.link).toBe("link1")
		})

		it("should collect paths correctly", () => {
			map.path = "/root"
			map.children = [
				{
					name: "middle",
					path: "/root/middle",
					type: "Folder",
					attributes: {},
					children: [
						{
							name: "a",
							type: "File",
							path: "/root/middle/a",
							attributes: {}
						},
						{
							name: "b",
							type: "File",
							path: "/root/middle/b",
							attributes: {}
						}
					]
				}
			]
			const result = NodeDecorator.decorateMap(map, fileMeta, metricData)
			expect(result.path).toBe("/root/middle")
		})

		it("should not compact with single leaves", () => {
			map.children = [
				{
					name: "middle",
					type: "Folder",
					attributes: {},
					children: [
						{
							name: "singleLeaf",
							type: "File",
							attributes: {}
						}
					]
				}
			]
			const result = NodeDecorator.decorateMap(map, fileMeta, metricData)
			expect(result.name).toBe("root/middle")
			expect(result.children.length).toBe(1)
			expect(result.children[0].name).toBe("singleLeaf")
		})

		it("should compact intermediate middle packages", () => {
			map.children = [
				{
					name: "start",
					type: "Folder",
					attributes: {},
					children: [
						{
							name: "middle",
							type: "Folder",
							attributes: {},
							children: [
								{
									name: "middle2",
									type: "Folder",
									attributes: {},
									children: [
										{
											name: "a",
											type: "File",
											attributes: {}
										},
										{
											name: "b",
											type: "File",
											attributes: {}
										}
									]
								}
							]
						},
						{
							name: "c",
							type: "File",
							attributes: {}
						}
					]
				}
			]
			const result = NodeDecorator.decorateMap(map, fileMeta, metricData)
			expect(result.name).toBe("root/start")
			expect(result.children.length).toBe(2)
			expect(result.children[0].name).toBe("middle/middle2")
			expect(result.children[1].name).toBe("c")
			expect(result.children[0].children.length).toBe(2)
			expect(result.children[0].children[0].name).toBe("a")
			expect(result.children[0].children[1].name).toBe("b")
		})
	})

	describe("preDecorateFile", () => {
		it("should decorate nodes with the correct path", () => {
			const result = NodeDecorator.preDecorateFile(file)

			let h = d3.hierarchy(result.map)
			h.each(node => {
				expect(node.data.path).toBeDefined()
			})

			expect(result.map.path).toBe("/root")
			expect(result.map.children[1].children[0].path).toBe("/root/Parent Leaf/small leaf")
		})
	})

	describe("decorateMap", () => {
		it("all nodes should have an attribute list with all possible metrics", () => {
			map.children[0].attributes = undefined
			map.children[1].attributes = { some: 1 }
			metricData.push({ name: "some", maxValue: 999999, availableInVisibleMaps: true })

			let result = NodeDecorator.decorateMap(map, fileMeta, metricData)
			result = NodeDecorator.decorateParentNodesWithSumAttributes(result, blacklist, metricData, [], false)
			let h = d3.hierarchy(result)
			h.each(node => {
				expect(node.data.attributes).toBeDefined()
				expect(node.data.attributes.some).toBeDefined()
			})
		})

		it("all nodes should have an attribute list with listed and available metrics", () => {
			let result = NodeDecorator.decorateMap(map, fileMeta, metricData)
			result = NodeDecorator.decorateParentNodesWithSumAttributes(result, blacklist, metricData, [], false)
			let h = d3.hierarchy(result)
			h.each(node => {
				expect(node.data.attributes).toBeDefined()
				expect(node.data.attributes["rloc"]).toBeDefined()
				expect(node.data.attributes["functions"]).toBeDefined()
			})
		})

		it("folders should have sum attributes of children", () => {
			let result = NodeDecorator.decorateMap(map, fileMeta, metricData)
			result = NodeDecorator.decorateParentNodesWithSumAttributes(result, blacklist, metricData, [], false)
			let h = d3.hierarchy(result)
			expect(h.data.attributes["rloc"]).toBe(200)
			expect(h.children[0].data.attributes["rloc"]).toBe(100)
			expect(h.data.attributes["functions"]).toBe(1110)
		})

		it("folders should have sum delta values of children", () => {
			let result = NodeDecorator.decorateMap(deltaMap, fileMeta, metricData)
			result = NodeDecorator.decorateParentNodesWithSumAttributes(result, blacklist, metricData, [], true)
			let h = d3.hierarchy(result)
			expect(h.data.deltas["rloc"]).toBe(295)
			expect(h.children[0].data.deltas["rloc"]).toBe(300)
			expect(h.children[2].data.deltas["rloc"]).toBe(145)
			expect(h.data.deltas["functions"]).toBe(5)
		})

		it("maps with no attribute nodes should be accepted and an attributes member added", () => {
			const result = NodeDecorator.decorateMap(map, fileMeta, metricData)

			let h = d3.hierarchy(result)

			h.each(node => {
				expect(node.data.attributes["unary"]).toBeDefined()
			})
		})

		it("all nodes should have a unary attribute", () => {
			map.children[0].attributes = {}
			const result = NodeDecorator.decorateMap(map, fileMeta, metricData)
			let h = d3.hierarchy(result)
			h.each(node => {
				expect(node.data.attributes["unary"]).toBeDefined()
			})
		})
	})
})
