import { NodeType } from "../../../codeCharta.model"
import { FileToValue, getFilenamesWithHighestMetrics, updateAttributeMap } from "./getFilenamesWithHighestMetrics"

let MAP: Map<string, FileToValue[]>

beforeEach(() => {
	MAP = new Map<string, FileToValue[]>([
		[
			"mcc",
			[
				{ name: "file2", value: 500 },
				{ name: "file3", value: 400 },
				{ name: "file1", value: 300 },
				{ name: "file1", value: 200 },
				{ name: "file1", value: 100 },
				{ name: "file1", value: 50 },
				{ name: "file1", value: 20 },
				{ name: "file1", value: 15 },
				{ name: "file1", value: 10 },
				{ name: "file1", value: 5 }
			]
		]
	])
})

describe("getFilenamesWithHighestMetrics", () => {
	it("should return a map with keys for exactly two attribute", () => {
		const resultMap = getFilenamesWithHighestMetrics(BIG_NODE_WITH_TWO_ATTRIBUTES)
		const mccResults = resultMap.get("mcc")
		const rlocResults = resultMap.get("rloc")

		expect(resultMap.size).toBe(2)
		expect(mccResults).toBeTruthy()
		expect(rlocResults).toBeTruthy()
	})

	it("should return correct values for rloc and mcc", () => {
		const resultMap = getFilenamesWithHighestMetrics(BIG_NODE_WITH_TWO_ATTRIBUTES)
		const mccResults = resultMap.get("mcc")
		const rlocResults = resultMap.get("rloc")

		expect(rlocResults).toEqual([{ name: "leaf1", value: 5 }])
		expect(mccResults).toEqual([
			{ name: "leaf1", value: 10 },
			{ name: "leaf2", value: 9 },
			{ name: "leaf3", value: 8 },
			{ name: "leaf4", value: 7 },
			{ name: "leaf5", value: 6 },
			{ name: "leaf6", value: 5 },
			{ name: "leaf7", value: 4 },
			{ name: "leaf8", value: 3 },
			{ name: "leaf9", value: 2 },
			{ name: "leaf10", value: 1 }
		])
	})

	it("should ignore folders", () => {
		const map = getFilenamesWithHighestMetrics(CONTAINS_FOLDER_WITH_ATTRIBUTES)

		expect(map.get("rloc")).toBeUndefined()
		expect(map.get("mcc")).toEqual([{ name: "file", value: 0 }])
	})
})

describe("updateAttributeMap", () => {
	it("should not add if value is too low", () => {
		updateAttributeMap("mcc", 0, "file with low value", MAP)

		expect(MAP.get("mcc")).not.toContainEqual({ name: "file with low value", value: 0 })
		expect(MAP.get("mcc").length).toBe(10)
	})

	it("should add if value is high", () => {
		updateAttributeMap("mcc", 9001, "file with highest value", MAP)

		expect(MAP.get("mcc")).toContainEqual({ name: "file with highest value", value: 9001 })
		expect(MAP.get("mcc").length).toBe(10)
	})

	it("should add if map is empty", () => {
		const EMPTY_MAP = new Map<string, FileToValue[]>()

		updateAttributeMap("mcc", 0, "first file", EMPTY_MAP)

		expect(EMPTY_MAP.get("mcc")).toContainEqual({ name: "first file", value: 0 })
		expect(EMPTY_MAP.get("mcc").length).toBe(1)
	})

	it("should add if key has less than 10 values", () => {
		const TINY_MAP = new Map<string, FileToValue[]>([["mcc", [{ name: "first file", value: 424_242 }]]])

		updateAttributeMap("mcc", 0, "second file", TINY_MAP)

		expect(TINY_MAP.get("mcc")).toContainEqual({ name: "second file", value: 0 })
		expect(TINY_MAP.get("mcc").length).toBe(2)
	})

	it("should add if key is different", () => {
		updateAttributeMap("rloc", 0, "first rloc file", MAP)

		expect(MAP.get("rloc")).toEqual([{ name: "first rloc file", value: 0 }])
		expect(MAP.get("mcc").length).toBe(10)
		expect(MAP.size).toBe(2)
	})
})

const BIG_NODE_WITH_TWO_ATTRIBUTES = {
	name: "root",
	type: NodeType.FOLDER,
	children: [
		{
			name: "folder",
			type: NodeType.FOLDER,
			children: [
				{ name: "leaf2", attributes: { ["mcc"]: 9 }, type: NodeType.FILE },
				{ name: "leaf3", attributes: { ["mcc"]: 8 }, type: NodeType.FILE },
				{ name: "leaf4", attributes: { ["mcc"]: 7 }, type: NodeType.FILE },
				{ name: "leaf5", attributes: { ["mcc"]: 6 }, type: NodeType.FILE },
				{ name: "leaf6", attributes: { ["mcc"]: 5 }, type: NodeType.FILE },
				{ name: "leaf7", attributes: { ["mcc"]: 4 }, type: NodeType.FILE },
				{ name: "leaf8", attributes: { ["mcc"]: 3 }, type: NodeType.FILE },
				{ name: "leaf9", attributes: { ["mcc"]: 2 }, type: NodeType.FILE },
				{ name: "leaf10", attributes: { ["mcc"]: 1 }, type: NodeType.FILE },
				{ name: "leaf11", attributes: { ["mcc"]: 0 }, type: NodeType.FILE }
			]
		},
		{ name: "leaf1", attributes: { ["mcc"]: 10, ["rloc"]: 5 }, type: NodeType.FILE }
	]
}

const CONTAINS_FOLDER_WITH_ATTRIBUTES = {
	name: "root_folder",
	type: NodeType.FOLDER,
	attributes: { mcc: 111, rloc: 15 },
	children: [{ name: "file", type: NodeType.FILE, attributes: { mcc: 0 } }]
}
