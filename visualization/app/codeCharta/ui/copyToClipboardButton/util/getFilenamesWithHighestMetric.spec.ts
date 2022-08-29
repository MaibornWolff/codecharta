import { NodeType } from "../../../codeCharta.model"
import { FileToValue, getFilenamesWithHighestMetrics, updateAttributeMap } from "./getFilenamesWithHighestMetrics"

let MAP: Map<string, FileToValue[]>

beforeEach(() => {
	MAP = new Map<string, FileToValue[]>([
		[
			"mcc",
			[
				{ filePath: "root/app/file2", value: 500 },
				{ filePath: "root/app/file3", value: 400 },
				{ filePath: "root/app/file1", value: 300 },
				{ filePath: "root/app/file1", value: 200 },
				{ filePath: "root/app/file1", value: 100 },
				{ filePath: "root/app/file1", value: 50 },
				{ filePath: "root/app/file1", value: 20 },
				{ filePath: "root/app/file1", value: 15 },
				{ filePath: "root/app/file1", value: 10 },
				{ filePath: "root/app/file1", value: 5 }
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

		expect(rlocResults).toEqual([{ filePath: "root/leaf1", value: 5 }])
		expect(mccResults).toEqual([
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
		])
	})

	it("should ignore folders", () => {
		const map = getFilenamesWithHighestMetrics(CONTAINS_FOLDER_WITH_ATTRIBUTES)

		expect(map.get("rloc")).toBeUndefined()
		expect(map.get("mcc")).toEqual([{ filePath: "root/file", value: 0 }])
	})
})

describe("updateAttributeMap", () => {
	it("should not add item to attribute if value is lower than old values", () => {
		updateAttributeMap("mcc", 0, "app/src/lowValueFile", MAP)

		expect(MAP.get("mcc")).not.toContainEqual({ filePath: "app/src/lowValueFile", value: 0 })
		expect(MAP.get("mcc").length).toBe(10)
	})

	it("should add item to attribute if value is higher than old values", () => {
		updateAttributeMap("mcc", 9001, "app/src/highValueFile", MAP)

		expect(MAP.get("mcc")).toContainEqual({ filePath: "app/src/highValueFile", value: 9001 })
		expect(MAP.get("mcc").length).toBe(10)
	})

	it("should add attribute and attribute gets item if map is empty", () => {
		const EMPTY_MAP = new Map<string, FileToValue[]>()

		updateAttributeMap("mcc", 0, "root/app/firstFile", EMPTY_MAP)

		expect(EMPTY_MAP.get("mcc")).toContainEqual({ filePath: "root/app/firstFile", value: 0 })
		expect(EMPTY_MAP.get("mcc").length).toBe(1)
	})

	it("should add item to attribute if attribute has only one item", () => {
		const TINY_MAP = new Map<string, FileToValue[]>([["mcc", [{ filePath: "root/app/firstFile", value: 424_242 }]]])

		updateAttributeMap("mcc", 0, "root/secondFile", TINY_MAP)

		expect(TINY_MAP.get("mcc")).toEqual([
			{ filePath: "root/app/firstFile", value: 424_242 },
			{ filePath: "root/secondFile", value: 0 }
		])
		expect(TINY_MAP.get("mcc").length).toBe(2)
	})

	it("should add new attribute and new attribute gets item and old attribute does not change", () => {
		const oldMcc = MAP.get("mcc")

		updateAttributeMap("rloc", 0, "app/rlocFile", MAP)
		const newMcc = MAP.get("mcc")

		expect(MAP.get("rloc")).toEqual([{ filePath: "app/rlocFile", value: 0 }])
		expect(oldMcc).toBe(newMcc)
		expect(MAP.size).toBe(2)
	})
})

const BIG_NODE_WITH_TWO_ATTRIBUTES = {
	path: "root/",
	type: NodeType.FOLDER,
	children: [
		{
			path: "folder",
			type: NodeType.FOLDER,
			children: [
				{ path: "root/leaf2", attributes: { ["mcc"]: 9 }, type: NodeType.FILE },
				{ path: "root/leaf3", attributes: { ["mcc"]: 8 }, type: NodeType.FILE },
				{ path: "root/leaf4", attributes: { ["mcc"]: 7 }, type: NodeType.FILE },
				{ path: "root/leaf5", attributes: { ["mcc"]: 6 }, type: NodeType.FILE },
				{ path: "root/leaf6", attributes: { ["mcc"]: 5 }, type: NodeType.FILE },
				{ path: "root/leaf7", attributes: { ["mcc"]: 4 }, type: NodeType.FILE },
				{ path: "root/leaf8", attributes: { ["mcc"]: 3 }, type: NodeType.FILE },
				{ path: "root/leaf9", attributes: { ["mcc"]: 2 }, type: NodeType.FILE },
				{ path: "root/leaf10", attributes: { ["mcc"]: 1 }, type: NodeType.FILE },
				{ path: "root/leaf11", attributes: { ["mcc"]: 0 }, type: NodeType.FILE }
			]
		},
		{ path: "root/leaf1", attributes: { ["mcc"]: 10, ["rloc"]: 5 }, type: NodeType.FILE }
	]
}

const CONTAINS_FOLDER_WITH_ATTRIBUTES = {
	path: "root/",
	type: NodeType.FOLDER,
	attributes: { mcc: 111, rloc: 15 },
	children: [{ path: "root/file", type: NodeType.FILE, attributes: { mcc: 0 }, children: [] }]
}
