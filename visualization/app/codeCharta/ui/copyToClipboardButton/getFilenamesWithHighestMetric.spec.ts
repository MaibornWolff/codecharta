import { FileToValue, maybeAddToMap } from "./getFilenamesWithHighestMetrics"

let MAP: Map<string, FileToValue[]>

beforeEach(() => {
	MAP = new Map<string, FileToValue[]>([
		[
			"mcc",
			[
				{ name: "file2", value: 11 },
				{ name: "file3", value: 12 },
				{ name: "file1", value: 13 },
				{ name: "file1", value: 13 },
				{ name: "file1", value: 13 },
				{ name: "file1", value: 13 },
				{ name: "file1", value: 13 },
				{ name: "file1", value: 13 },
				{ name: "file1", value: 13 },
				{ name: "file1", value: 13 }
			]
		]
	])
})

describe("getFilenamesWithHighestMetric", () => {
	it("maybeAddToMap should not add if value is too low", () => {
		maybeAddToMap("mcc", 0, "file with low value", MAP)

		expect(MAP.get("mcc")).not.toContainEqual({ name: "file with low value", value: 0 })
		expect(MAP.get("mcc").length).toBe(10)
	})
	it("maybeAddToMap should add if value is high", () => {
		maybeAddToMap("mcc", 9001, "file with highest value", MAP)

		expect(MAP.get("mcc")).toContainEqual({ name: "file with highest value", value: 9001 })
		expect(MAP.get("mcc").length).toBe(10)
	})
	it("maybeAddToMap should add if map is empty", () => {
		const EMPTY_MAP = new Map<string, FileToValue[]>()

		maybeAddToMap("mcc", 0, "first file", EMPTY_MAP)

		expect(EMPTY_MAP.get("mcc")).toContainEqual({ name: "first file", value: 0 })
		expect(EMPTY_MAP.get("mcc").length).toBe(1)
	})
	it("maybeAddToMap should add if key has less than 10 values", () => {
		const TINY_MAP = new Map<string, FileToValue[]>([["mcc", [{ name: "first file", value: 424_242 }]]])

		maybeAddToMap("mcc", 0, "second file", TINY_MAP)

		expect(TINY_MAP.get("mcc")).toContainEqual({ name: "second file", value: 0 })
		expect(TINY_MAP.get("mcc").length).toBe(2)
	})
	it("maybeAddToMap should add if key is different", () => {
		maybeAddToMap("rloc", 0, "first rloc file", MAP)

		expect(MAP.get("rloc")).toEqual([{ name: "first rloc file", value: 0 }])
		expect(MAP.get("mcc").length).toBe(10)
		expect(MAP.size).toBe(2)
	})
})
