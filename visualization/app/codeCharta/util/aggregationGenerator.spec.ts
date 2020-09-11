import { CCFile, NodeType, Settings } from "../codeCharta.model"
import { AggregationGenerator } from "./aggregationGenerator"
import packageJson from "../../../package.json"

describe("AggregationGenerator", () => {
	const file1: CCFile = {
		fileMeta: {
			fileName: "file1",
			projectName: "Sample Project",
			apiVersion: packageJson.codecharta.apiVersion
		},
		map: {
			name: "root",
			type: NodeType.FOLDER,
			path: "/root",
			attributes: { rloc: 170, functions: 1010, mcc: 11 },
			children: [
				{
					name: "big leaf",
					type: NodeType.FILE,
					path: "/root/big leaf",
					attributes: { rloc: 100, functions: 10, mcc: 1 },
					link: "http://www.google.de"
				},
				{
					name: "Parent Leaf",
					type: NodeType.FOLDER,
					path: "/root/Parent Leaf",
					attributes: { rloc: 70, functions: 1000, mcc: 10 },
					children: [
						{
							name: "other small leaf",
							type: NodeType.FILE,
							path: "/root/Parent Leaf/other small leaf",
							attributes: { rloc: 70, functions: 1000, mcc: 10 }
						}
					]
				}
			]
		},
		settings: {} as Settings
	}

	const file2: CCFile = {
		fileMeta: {
			fileName: "file2",
			projectName: "Sample Project",
			apiVersion: packageJson.codecharta.apiVersion
		},
		map: {
			name: "root",
			type: NodeType.FOLDER,
			path: "/root",
			attributes: { rloc: 260, functions: 220, mcc: 202, customMetric: 7 },
			children: [
				{
					name: "big leaf",
					type: NodeType.FILE,
					path: "/root/big leaf",
					attributes: { rloc: 200, functions: 20, mcc: 2 },
					link: "http://www.google.de"
				},
				{
					name: "Parent Leaf",
					type: NodeType.FOLDER,
					path: "/root/Parent Leaf",
					attributes: { rloc: 60, functions: 200, mcc: 200 },
					children: [
						{
							name: "small leaf",
							type: NodeType.FILE,
							path: "/root/Parent Leaf/small leaf",
							attributes: { rloc: 60, functions: 200, mcc: 200 }
						}
					]
				}
			]
		},
		settings: {} as Settings
	}

	describe("multipleService", () => {
		it("aggregation of two maps", () => {
			const aggregationFile = AggregationGenerator.getAggregationFile([file1, file2])
			expect(aggregationFile).toMatchSnapshot()
		})

		it("aggregation of four maps", () => {
			const aggregationFile = AggregationGenerator.getAggregationFile([file1, file2, file1, file2])
			expect(aggregationFile).toMatchSnapshot()
		})

		it("aggregation one map", () => {
			const aggregationFile = AggregationGenerator.getAggregationFile([file1])
			expect(aggregationFile).toMatchSnapshot()
		})

		it("aggregate two aggregated maps should aggregate the attributes to root", () => {
			const aggregationFile = AggregationGenerator.getAggregationFile([file1, file2])
			expect(aggregationFile.map.attributes.rloc).toBe(430)
			expect(aggregationFile.map.attributes.functions).toBe(1230)
			expect(aggregationFile.map.attributes.mcc).toBe(213)
			expect(aggregationFile.map.attributes.customMetric).toBe(7)
		})
	})
})
