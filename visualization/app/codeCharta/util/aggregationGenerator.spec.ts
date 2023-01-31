import { NodeType, Settings } from "../codeCharta.model"
import { AggregationGenerator } from "./aggregationGenerator"
import packageJson from "../../../package.json"
import { FileState } from "../model/files/files"

describe("AggregationGenerator", () => {
	let fileState1: Pick<FileState, "file">
	let fileState2: Pick<FileState, "file">

	beforeEach(() => {
		AggregationGenerator["memorizedAggregation"] = { key: undefined, aggregation: undefined }
		fileState1 = {
			file: {
				fileMeta: {
					fileName: "file1",
					fileChecksum: "md5-file1",
					projectName: "Sample Project",
					apiVersion: packageJson.codecharta.apiVersion,
					exportedFileSize: 300_000
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
							link: "https://www.google.de"
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
		}

		fileState2 = {
			file: {
				fileMeta: {
					fileName: "file2",
					fileChecksum: "md5-file2",
					projectName: "Sample Project",
					apiVersion: packageJson.codecharta.apiVersion,
					exportedFileSize: 300_000
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
							link: "https://www.google.de"
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
		}
	})

	it("aggregation of two maps", () => {
		const aggregationFile = AggregationGenerator.calculateAggregationFile([fileState1, fileState2])
		expect(aggregationFile).toMatchSnapshot()
	})

	it("aggregation of four maps", () => {
		const aggregationFile = AggregationGenerator.calculateAggregationFile([fileState1, fileState2, fileState1, fileState2])
		expect(aggregationFile).toMatchSnapshot()
	})

	it("aggregation one map", () => {
		const aggregationFile = AggregationGenerator.calculateAggregationFile([fileState1])
		expect(aggregationFile).toMatchSnapshot()
	})

	it("aggregate two aggregated maps should aggregate the attributes to root without manipulating original fileState", () => {
		const aggregationFile = AggregationGenerator.calculateAggregationFile([fileState1, fileState2])
		expect(aggregationFile.map.attributes.rloc).toBe(430)
		expect(aggregationFile.map.attributes.functions).toBe(1230)
		expect(aggregationFile.map.attributes.mcc).toBe(213)
		expect(aggregationFile.map.attributes.customMetric).toBe(7)
		expect(fileState1.file.map.children[0].path).toBe("/root/big leaf")
	})
})
