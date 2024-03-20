import { NodeType } from "../../../codeCharta.model"
import { getFilenamesWithHighestMetrics } from "./getFilenamesWithHighestMetrics"

describe("getFileNamesWithHighestMetrics", () => {
	it("should ignore folders", () => {
		const map = getFilenamesWithHighestMetrics(NODE_FOLDER_TWO_NEGATIVE_ATTRIBUTES, null)

		expect(map.get("rloc")).toBeUndefined()
		expect(map.get("mcc")).toEqual([{ filePath: "root/file", value: 0 }])
	})

	it("should return correct map for attributes with negative direction only", () => {
		const resultMap = getFilenamesWithHighestMetrics(NODE_TWO_NEGATIVE_ATTRIBUTES, null)
		const mccResults = resultMap.get("mcc")
		const rlocResults = resultMap.get("rloc")

		expect(resultMap.size).toBe(2)
		expect(rlocResults).toEqual(rlocResultsExpected)
		expect(mccResults).toEqual(mccResultsExpected)
	})

	it("should return correct map for attributes with positiv direction only", () => {
		const resultMap = getFilenamesWithHighestMetrics(NODE_TWO_POSITIVE_ATTRIBUTES, {
			branch_coverage: {
				title: "",
				description: "",
				hintLowValue: "",
				hintHighValue: "",
				link: "",
				direction: 1
			},
			tests: {
				title: "",
				description: "",
				hintLowValue: "",
				hintHighValue: "",
				link: "",
				direction: 1
			}
		})
		const testsResults = resultMap.get("tests")
		const branchCoverageResults = resultMap.get("branch_coverage")

		expect(resultMap.size).toBe(2)
		expect(branchCoverageResults).toEqual(branchCoverageResultsExpected)

		expect(testsResults).toEqual(testsResultsExpected)
	})

	it("should return correct map for attributes with both positiv and negative direction", () => {
		const resultMap = getFilenamesWithHighestMetrics(NODE_POSITIVE_NEGATIVE_ATTRIBUTES, {
			branch_coverage: {
				title: "",
				description: "",
				hintLowValue: "",
				hintHighValue: "",
				link: "",
				direction: 1
			},
			tests: {
				title: "",
				description: "",
				hintLowValue: "",
				hintHighValue: "",
				link: "",
				direction: 1
			}
		})

		const mccResults = resultMap.get("mcc")
		const rlocResults = resultMap.get("rloc")
		const testsResults = resultMap.get("tests")
		const branchCoverageResults = resultMap.get("branch_coverage")

		expect(resultMap.size).toBe(4)
		expect(rlocResults).toEqual(rlocResultsExpected)
		expect(mccResults).toEqual(mccResultsExpected)
		expect(branchCoverageResults).toEqual(branchCoverageResultsExpected)
		expect(testsResults).toEqual(testsResultsExpected)
	})
})

const NODE_TWO_NEGATIVE_ATTRIBUTES = {
	path: "root/",
	type: NodeType.FOLDER,
	children: [
		{
			path: "folder1",
			type: NodeType.FOLDER,
			children: [
				{ path: "root/leaf2", attributes: { ["mcc"]: 9, ["rloc"]: 100 }, type: NodeType.FILE },
				{ path: "root/leaf3", attributes: { ["mcc"]: 8, ["rloc"]: 99 }, type: NodeType.FILE },
				{ path: "root/leaf4", attributes: { ["mcc"]: 7, ["rloc"]: 98 }, type: NodeType.FILE },
				{ path: "root/leaf5", attributes: { ["mcc"]: 6, ["rloc"]: 97 }, type: NodeType.FILE },
				{ path: "root/leaf6", attributes: { ["mcc"]: 5, ["rloc"]: 96 }, type: NodeType.FILE },
				{ path: "root/leaf7", attributes: { ["mcc"]: 4, ["rloc"]: 95 }, type: NodeType.FILE },
				{ path: "root/leaf8", attributes: { ["mcc"]: 3, ["rloc"]: 94 }, type: NodeType.FILE },
				{ path: "root/leaf9", attributes: { ["mcc"]: 2, ["rloc"]: 93 }, type: NodeType.FILE },
				{ path: "root/leaf10", attributes: { ["mcc"]: 1, ["rloc"]: 92 }, type: NodeType.FILE },
				{ path: "root/leaf11", attributes: { ["mcc"]: 0, ["rloc"]: 91 }, type: NodeType.FILE }
			]
		},
		{ path: "root/leaf1", attributes: { ["mcc"]: 10, ["rloc"]: 93 }, type: NodeType.FILE }
	]
}

const NODE_TWO_POSITIVE_ATTRIBUTES = {
	path: "root/",
	type: NodeType.FOLDER,
	children: [
		{
			path: "folder2",
			type: NodeType.FOLDER,
			children: [
				{ path: "root/leaf2", attributes: { ["branch_coverage"]: 9, ["tests"]: 20 }, type: NodeType.FILE },
				{ path: "root/leaf3", attributes: { ["branch_coverage"]: 8, ["tests"]: 19 }, type: NodeType.FILE },
				{ path: "root/leaf4", attributes: { ["branch_coverage"]: 7, ["tests"]: 18 }, type: NodeType.FILE },
				{ path: "root/leaf5", attributes: { ["branch_coverage"]: 6, ["tests"]: 17 }, type: NodeType.FILE },
				{ path: "root/leaf6", attributes: { ["branch_coverage"]: 5, ["tests"]: 16 }, type: NodeType.FILE },
				{ path: "root/leaf7", attributes: { ["branch_coverage"]: 4, ["tests"]: 15 }, type: NodeType.FILE },
				{ path: "root/leaf8", attributes: { ["branch_coverage"]: 3, ["tests"]: 14 }, type: NodeType.FILE },
				{ path: "root/leaf9", attributes: { ["branch_coverage"]: 2, ["tests"]: 13 }, type: NodeType.FILE },
				{ path: "root/leaf10", attributes: { ["branch_coverage"]: 1, ["tests"]: 12 }, type: NodeType.FILE },
				{ path: "root/leaf11", attributes: { ["branch_coverage"]: 0, ["tests"]: 11 }, type: NodeType.FILE }
			]
		},
		{ path: "root/leaf2", attributes: { ["branch_coverage"]: 10, ["tests"]: 5 }, type: NodeType.FILE }
	]
}

const NODE_POSITIVE_NEGATIVE_ATTRIBUTES = {
	path: "root/",
	type: NodeType.FOLDER,
	children: [...NODE_TWO_NEGATIVE_ATTRIBUTES.children, ...NODE_TWO_POSITIVE_ATTRIBUTES.children]
}

const NODE_FOLDER_TWO_NEGATIVE_ATTRIBUTES = {
	path: "root/",
	type: NodeType.FOLDER,
	attributes: { mcc: 111, rloc: 15 },
	children: [{ path: "root/file", type: NodeType.FILE, attributes: { mcc: 0 }, children: [] }]
}

const rlocResultsExpected = [
	{ filePath: "root/leaf2", value: 100 },
	{ filePath: "root/leaf3", value: 99 },
	{ filePath: "root/leaf4", value: 98 },
	{ filePath: "root/leaf5", value: 97 },
	{ filePath: "root/leaf6", value: 96 },
	{ filePath: "root/leaf7", value: 95 },
	{ filePath: "root/leaf8", value: 94 },
	{ filePath: "root/leaf1", value: 93 },
	{ filePath: "root/leaf9", value: 93 },
	{ filePath: "root/leaf10", value: 92 }
]

const mccResultsExpected = [
	{ filePath: "root/leaf1", value: 10 },
	{ filePath: "root/leaf2", value: 9 },
	{ filePath: "root/leaf3", value: 8 },
	{ filePath: "root/leaf4", value: 7 },
	{ filePath: "root/leaf5", value: 6 },
	{ filePath: "root/leaf6", value: 5 },
	{ filePath: "root/leaf7", value: 4 },
	{ filePath: "root/leaf8", value: 3 },
	{ filePath: "root/leaf9", value: 2 },
	{ filePath: "root/leaf10", value: 1 }
]

const branchCoverageResultsExpected = [
	{ filePath: "root/leaf11", value: 0 },
	{ filePath: "root/leaf10", value: 1 },
	{ filePath: "root/leaf9", value: 2 },
	{ filePath: "root/leaf8", value: 3 },
	{ filePath: "root/leaf7", value: 4 },
	{ filePath: "root/leaf6", value: 5 },
	{ filePath: "root/leaf5", value: 6 },
	{ filePath: "root/leaf4", value: 7 },
	{ filePath: "root/leaf3", value: 8 },
	{ filePath: "root/leaf2", value: 9 }
]

const testsResultsExpected = [
	{ filePath: "root/leaf2", value: 5 },
	{ filePath: "root/leaf11", value: 11 },
	{ filePath: "root/leaf10", value: 12 },
	{ filePath: "root/leaf9", value: 13 },
	{ filePath: "root/leaf8", value: 14 },
	{ filePath: "root/leaf7", value: 15 },
	{ filePath: "root/leaf6", value: 16 },
	{ filePath: "root/leaf5", value: 17 },
	{ filePath: "root/leaf4", value: 18 },
	{ filePath: "root/leaf3", value: 19 }
]
