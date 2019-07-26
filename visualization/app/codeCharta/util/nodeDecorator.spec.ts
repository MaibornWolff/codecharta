import * as d3 from "d3"
import { SETTINGS, TEST_DELTA_MAP_A } from "./dataMocks"
import { CCFile, MetricData, BlacklistItem } from "../codeCharta.model"
import { NodeDecorator } from "./nodeDecorator"
import { CodeMapHelper } from "./codeMapHelper"

describe("nodeDecorator", () => {
	let fileA: CCFile
	let metricData: MetricData[]
	let blacklist: BlacklistItem[]

	beforeEach(() => {
		fileA = JSON.parse(JSON.stringify(TEST_DELTA_MAP_A))
		metricData = [
			{ name: "rloc", maxValue: 999999, availableInVisibleMaps: true },
			{ name: "functions", maxValue: 999999, availableInVisibleMaps: true },
			{ name: "mcc", maxValue: 999999, availableInVisibleMaps: true }
		]
		blacklist = JSON.parse(JSON.stringify(SETTINGS.fileSettings.blacklist))
	})

	describe("decorateFile", () => {
		beforeEach(() => {
			CodeMapHelper.isBlacklisted = jest.fn()
		})

		it("should aggregate given metrics correctly", () => {
			const result = NodeDecorator.decorateFile(fileA, blacklist, metricData)

			expect(result.map.attributes["rloc"]).toBe(200)
			expect(result.map.attributes["functions"]).toBe(1110)
			expect(result.map.attributes["mcc"]).toBe(111)
		})

		it("should aggregate missing metrics correctly", () => {
			metricData.push({ name: "some", maxValue: 999999, availableInVisibleMaps: true })
			const result = NodeDecorator.decorateFile(fileA, blacklist, metricData)

			expect(result.map.attributes["rloc"]).toBe(200)
			expect(result.map.attributes["some"]).toBe(0)
			expect(result.map.attributes["some other attribute"]).not.toBeDefined()
		})

		it("leaves should have all metrics", () => {
			metricData.push({ name: "some", maxValue: 999999, availableInVisibleMaps: true })
			const result = NodeDecorator.decorateFile(fileA, blacklist, metricData)

			let h = d3.hierarchy(result.map)
			h.leaves().forEach(node => {
				expect(node.data.attributes).toBeDefined()
				expect(node.data.attributes.some).toBe(0)
				expect(node.data.attributes.rloc).toBeDefined()
				expect(node.data.attributes.functions).toBeDefined()
				expect(node.data.attributes.mcc).toBeDefined()
			})
		})

		it("leaves should have all metrics even if some attributesLists are undefined", () => {
			fileA.map.children[0].attributes = undefined
			metricData.push({ name: "some", maxValue: 999999, availableInVisibleMaps: true })

			const result = NodeDecorator.decorateFile(fileA, blacklist, metricData)
			let h = d3.hierarchy(result.map)
			h.leaves().forEach(node => {
				expect(node.data.attributes).toBeDefined()
				expect(node.data.attributes.some).toBe(0)
				expect(node.data.attributes.rloc).toBeDefined()
				expect(node.data.attributes.functions).toBeDefined()
				expect(node.data.attributes.mcc).toBeDefined()
			})
		})

		it("should compact from root", () => {
			fileA.map.children = [
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
			const result = NodeDecorator.decorateFile(fileA, blacklist, metricData)
			expect(result.map.name).toBe("root/middle")
			expect(result.map.children.length).toBe(2)
			expect(result.map.children[0].name).toBe("a")
			expect(result.map.children[1].name).toBe("b")
		})

		it("should collect links correctly", () => {
			fileA.map.link = "link0"
			fileA.map.children = [
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
			const result = NodeDecorator.decorateFile(fileA, blacklist, metricData)
			expect(result.map.link).toBe("link1")
		})

		it("should collect paths correctly", () => {
			fileA.map.path = "/root"
			fileA.map.children = [
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
			const result = NodeDecorator.decorateFile(fileA, blacklist, metricData)
			expect(result.map.path).toBe("/root/middle")
		})

		it("should not compact with single leaves", () => {
			fileA.map.children = [
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
			const result = NodeDecorator.decorateFile(fileA, blacklist, metricData)
			expect(result.map.name).toBe("root/middle")
			expect(result.map.children.length).toBe(1)
			expect(result.map.children[0].name).toBe("singleLeaf")
		})

		it("should compact intermediate middle packages", () => {
			fileA.map.children = [
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
			const result = NodeDecorator.decorateFile(fileA, blacklist, metricData)
			expect(result.map.name).toBe("root/start")
			expect(result.map.children.length).toBe(2)
			expect(result.map.children[0].name).toBe("middle/middle2")
			expect(result.map.children[1].name).toBe("c")
			expect(result.map.children[0].children.length).toBe(2)
			expect(result.map.children[0].children[0].name).toBe("a")
			expect(result.map.children[0].children[1].name).toBe("b")
		})
	})

	describe("preDecorateFile", () => {
		it("should decorate nodes with the correct path", () => {
			const result = NodeDecorator.preDecorateFile(TEST_DELTA_MAP_A)

			let h = d3.hierarchy(result.map)
			h.each(node => {
				expect(node.data.path).toBeDefined()
			})

			expect(result.map.path).toBe("/root")
			expect(result.map.children[1].children[0].path).toBe("/root/Parent Leaf/small leaf")
		})
	})

	describe("decorateFile", () => {
		it("all nodes should have an attribute list with all possible metrics", () => {
			fileA.map.children[0].attributes = undefined
			fileA.map.children[1].attributes = { some: 1 }
			metricData.push({ name: "some", maxValue: 999999, availableInVisibleMaps: true })

			const result = NodeDecorator.decorateFile(fileA, blacklist, metricData)
			let h = d3.hierarchy(result.map)
			h.each(node => {
				expect(node.data.attributes).toBeDefined()
				expect(node.data.attributes.some).toBeDefined()
			})
		})

		it("all nodes should have an attribute list with listed and available metrics", () => {
			const result = NodeDecorator.decorateFile(fileA, blacklist, metricData)
			let h = d3.hierarchy(result.map)
			h.each(node => {
				expect(node.data.attributes).toBeDefined()
				expect(node.data.attributes["rloc"]).toBeDefined()
				expect(node.data.attributes["functions"]).toBeDefined()
			})
		})

		it("folders should have sum attributes of children", () => {
			const result = NodeDecorator.decorateFile(fileA, blacklist, metricData)
			let h = d3.hierarchy(result.map)
			expect(h.data.attributes["rloc"]).toBe(200)
			expect(h.children[0].data.attributes["rloc"]).toBe(100)
			expect(h.data.attributes["functions"]).toBe(1110)
		})

		it("all nodes should have an origin", () => {
			fileA.map.children[0].origin = undefined
			const result = NodeDecorator.decorateFile(fileA, blacklist, metricData)
			let h = d3.hierarchy(result.map)
			h.each(node => {
				expect(node.data.origin).toBeDefined()
			})
		})

		it("maps with no attribute nodes should be accepted and an attributes member added", () => {
			const result = NodeDecorator.decorateFile(TEST_DELTA_MAP_A, blacklist, metricData)

			let h = d3.hierarchy(result.map)

			h.each(node => {
				expect(node.data.attributes["unary"]).toBeDefined()
			})
		})

		it("all nodes should have a unary attribute", () => {
			fileA.map.children[0].attributes = {}
			const result = NodeDecorator.decorateFile(fileA, blacklist, metricData)
			let h = d3.hierarchy(result.map)
			h.each(node => {
				expect(node.data.attributes["unary"]).toBeDefined()
			})
		})
	})
})
