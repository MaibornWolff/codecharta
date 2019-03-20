import "./data.module"

import { CodeMap } from "./model/CodeMap"
import { TEST_DELTA_MAP_A, TEST_DELTA_MAP_B, TEST_MAP_WITH_BLACKLIST } from "./data.mocks"
import { DataDecorator } from "./data.decorator"
import * as d3 from "d3"

/**
 * @test {DataService}
 */
describe("app.codeCharta.core.data.dataService", () => {
	let a: CodeMap
	let b: CodeMap
	let mapWithNoBlacklist: CodeMap

	beforeEach(function() {
		a = JSON.parse(JSON.stringify(TEST_DELTA_MAP_A))
		b = JSON.parse(JSON.stringify(TEST_DELTA_MAP_B))
		mapWithNoBlacklist = JSON.parse(JSON.stringify(TEST_MAP_WITH_BLACKLIST))
	})

	describe("decorateLeavesWithMissingMetrics", () => {
		it("leaves should have all metrics", () => {
			DataDecorator.decorateLeavesWithMissingMetrics([a, b], ["some", "metrics", "rloc", "functions", "mcc"])
			let h = d3.hierarchy(a.nodes)
			h.leaves().forEach(node => {
				expect(node.data.attributes).toBeDefined()
				expect(node.data.attributes.some).toBe(0)
				expect(node.data.attributes.metrics).toBe(0)
				expect(node.data.attributes.rloc).toBeDefined()
				expect(node.data.attributes.functions).toBeDefined()
				expect(node.data.attributes.mcc).toBeDefined()
			})
		})

		it("leaves should have all metrics even if some attributesLists are undefined", () => {
			a.nodes.children[0].attributes = undefined
			DataDecorator.decorateLeavesWithMissingMetrics([a, b], ["some", "metrics", "rloc", "functions", "mcc"])
			let h = d3.hierarchy(a.nodes)
			h.leaves().forEach(node => {
				expect(node.data.attributes).toBeDefined()
				expect(node.data.attributes.some).toBe(0)
				expect(node.data.attributes.metrics).toBe(0)
				expect(node.data.attributes.rloc).toBeDefined()
				expect(node.data.attributes.functions).toBeDefined()
				expect(node.data.attributes.mcc).toBeDefined()
			})
		})
	})

	describe("compact middle packages", () => {
		it("should compact from root", () => {
			a.nodes.children = [
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
			DataDecorator.decorateMapWithCompactMiddlePackages(a)
			expect(a.nodes.name).toBe("root/middle")
			expect(a.nodes.children.length).toBe(2)
			expect(a.nodes.children[0].name).toBe("a")
			expect(a.nodes.children[1].name).toBe("b")
		})

		it("should collect links correctly", () => {
			a.nodes.link = "link0"
			a.nodes.children = [
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
			DataDecorator.decorateMapWithCompactMiddlePackages(a)
			expect(a.nodes.link).toBe("link1")
		})

		it("should collect paths correctly", () => {
			a.nodes.path = "/root"
			a.nodes.children = [
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
			DataDecorator.decorateMapWithCompactMiddlePackages(a)
			expect(a.nodes.path).toBe("/root/middle")
		})

		it("should not compact with single leaves", () => {
			a.nodes.children = [
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
			DataDecorator.decorateMapWithCompactMiddlePackages(a)
			expect(a.nodes.name).toBe("root/middle")
			expect(a.nodes.children.length).toBe(1)
			expect(a.nodes.children[0].name).toBe("singleLeaf")
		})

		it("should compact intermediate middle packages", () => {
			a.nodes.children = [
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
			DataDecorator.decorateMapWithCompactMiddlePackages(a)
			expect(a.nodes.name).toBe("root/start")
			expect(a.nodes.children.length).toBe(2)
			expect(a.nodes.children[0].name).toBe("middle/middle2")
			expect(a.nodes.children[1].name).toBe("c")
			expect(a.nodes.children[0].children.length).toBe(2)
			expect(a.nodes.children[0].children[0].name).toBe("a")
			expect(a.nodes.children[0].children[1].name).toBe("b")
		})
	})

	describe("decorateParentNodesWithSumAttributesOfChildren", () => {
		it("all nodes should have an attribute list with all possible metrics", () => {
			a.nodes.children[0].attributes = undefined
			a.nodes.children[1].attributes = { some: 1 }
			DataDecorator.decorateLeavesWithMissingMetrics([a], ["some", "metrics", "rloc", "functions", "mcc"])
			DataDecorator.decorateParentNodesWithSumAttributesOfChildren([a], ["some", "metrics", "rloc", "functions", "mcc"])
			let h = d3.hierarchy(a.nodes)
			h.each(node => {
				expect(node.data.attributes).toBeDefined()
				expect(node.data.attributes.some).toBeDefined()
				expect(node.data.attributes.metrics).toBeDefined()
			})
		})

		it("all nodes should have an attribute list with listed and available metrics", () => {
			DataDecorator.decorateLeavesWithMissingMetrics([a], ["rloc", "functions"])
			DataDecorator.decorateParentNodesWithSumAttributesOfChildren([a], ["rloc", "functions"])
			let h = d3.hierarchy(a.nodes)
			h.each(node => {
				expect(node.data.attributes).toBeDefined()
				expect(node.data.attributes["rloc"]).toBeDefined()
				expect(node.data.attributes["functions"]).toBeDefined()
			})
		})

		it("folders should have sum attributes of children", () => {
			DataDecorator.decorateLeavesWithMissingMetrics([a], ["rloc", "functions"])
			DataDecorator.decorateParentNodesWithSumAttributesOfChildren([a], ["rloc", "functions"])
			let h = d3.hierarchy(a.nodes)
			expect(h.data.attributes["rloc"]).toBe(200)
			expect(h.children[0].data.attributes["rloc"]).toBe(100)
			expect(h.data.attributes["functions"]).toBe(1110)
		})

		it("should ignore blacklisted files and folders for aggregation", () => {
			DataDecorator.blackList = mapWithNoBlacklist.blacklist
			DataDecorator.decorateMapWithPathAttribute(mapWithNoBlacklist)
			DataDecorator.decorateLeavesWithMissingMetrics([mapWithNoBlacklist], ["rloc", "functions"])
			DataDecorator.decorateParentNodesWithSumAttributesOfChildren([mapWithNoBlacklist], ["rloc", "functions"])

			let h = d3.hierarchy(mapWithNoBlacklist.nodes)
			expect(h.data.attributes["rloc"]).toBe(170)
			expect(h.children[1].data.attributes["rloc"]).toBe(70)

			expect(h.children[0].data.attributes["rloc"]).toBe(100)
			expect(h.data.attributes["functions"]).toBe(1010)
		})
	})

	describe("decorateMapWithOriginAttribute", () => {
		it("all nodes should have an origin", () => {
			a.nodes.children[0].origin = undefined
			DataDecorator.decorateMapWithOriginAttribute(a)
			let h = d3.hierarchy(a.nodes)
			h.each(node => {
				expect(node.data.origin).toBeDefined()
			})
		})
	})

	describe("decorateMapWithUnaryMetric", () => {
		it("maps with no attribute nodes should be accepted and an attributes member added", () => {
			let cm: CodeMap = {
				fileName: "a",
				projectName: "b",
				nodes: {
					name: "a node",
					type: "File",
					attributes: {}
				}
			}

			DataDecorator.decorateMapWithUnaryMetric(cm)

			let h = d3.hierarchy(cm.nodes)

			h.each(node => {
				expect(node.data.attributes["unary"]).toBeDefined()
			})
		})

		it("all nodes should have a unary attribute", () => {
			a.nodes.children[0].attributes = {}
			DataDecorator.decorateMapWithUnaryMetric(a)
			let h = d3.hierarchy(a.nodes)
			h.each(node => {
				expect(node.data.attributes["unary"]).toBeDefined()
			})
		})
	})

	describe("decorateMapWithPathAttribute", () => {
		it("should have the correct path", () => {
			let cm: CodeMap = {
				fileName: "a",
				projectName: "b",
				nodes: {
					name: "a node",
					type: "Folder",
					attributes: {},
					children: [
						{
							name: "b node",
							type: "File",
							attributes: {}
						},
						{
							name: "c node",
							type: "Folder",
							attributes: {},
							children: [
								{
									name: "d node",
									type: "File",
									attributes: {}
								}
							]
						}
					]
				}
			}

			DataDecorator.decorateMapWithPathAttribute(cm)

			let h = d3.hierarchy(cm.nodes)

			h.each(node => {
				expect(node.data.path).toBeDefined()
			})

			expect(cm.nodes.path).toBe("/a node")
			expect(cm.nodes.children[1].children[0].path).toBe("/a node/c node/d node")
		})
	})
})
