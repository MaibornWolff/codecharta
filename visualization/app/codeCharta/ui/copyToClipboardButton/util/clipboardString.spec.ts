import { buildTextOfFiles } from "./clipboardString"
import { FileToValue } from "./getFilenamesWithHighestMetrics"

describe("buildTextOfFiles", () => {
	it("should return only header line if there is only one attribute without files", () => {
		const result = buildTextOfFiles(WITH_ONE_FILELESS_ATTRIBUTE)

		expect(result).toBe("FUNCTIONS\n")
	})
	it("should return valid string if there two attributes", () => {
		const result = buildTextOfFiles(WITH_TWO_ATTRIBUTES)

		expect(result).toBe(
			`RLOC\n` + `\t${String.fromCodePoint(8226)} fileA (12)\n` + `COMMENTS\n` + `\t${String.fromCodePoint(8226)} fileA (14)\n`
		)
	})
	it("should return valid string if there is one attribute with many files", () => {
		const result = buildTextOfFiles(WITH_ONE_ATTRIBUTE)

		expect(result).toBe(
			`MCC\n` +
				`\t${String.fromCodePoint(8226)} file1 (100)\n` +
				`\t${String.fromCodePoint(8226)} file2 (84)\n` +
				`\t${String.fromCodePoint(8226)} file3 (122)\n`
		)
	})
})
const WITH_ONE_ATTRIBUTE = new Map<string, FileToValue[]>([
	[
		"mcc",
		[
			{ name: "file1", value: 100 },
			{ name: "file2", value: 84 },
			{ name: "file3", value: 122 }
		]
	]
])
const WITH_TWO_ATTRIBUTES = new Map<string, FileToValue[]>([
	["rloc", [{ name: "fileA", value: 12 }]],
	["comments", [{ name: "fileA", value: 14 }]]
])
const WITH_ONE_FILELESS_ATTRIBUTE = new Map<string, FileToValue[]>([["functions", []]])
