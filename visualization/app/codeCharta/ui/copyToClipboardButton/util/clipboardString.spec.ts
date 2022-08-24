import { buildTextOfFiles } from "./clipboardString"
import { FileToValue } from "./getFilenamesWithHighestMetrics"

describe("buildTextOfFiles", () => {
	it("should return only header line if there is only one attribute without files", () => {
		const result = buildTextOfFiles(WITH_ONE_FILELESS_ATTRIBUTE)

		expect(result).toBe("FUNCTIONS\n")
	})

	it("should return valid string if there two attributes", () => {
		const result = buildTextOfFiles(WITH_TWO_ATTRIBUTES)

		expect(result).toBe(`RLOC\n` + `\t• root/app/fileA (12)\n` + `COMMENTS\n` + `\t• root/app/fileA (14)\n`)
	})

	it("should return valid string if there is one attribute with many files", () => {
		const result = buildTextOfFiles(WITH_ONE_ATTRIBUTE)

		expect(result).toBe(`MCC\n` + `\t• root/app/file1 (100)\n` + `\t• root/app/file2 (84)\n` + `\t• root/app/file3 (122)\n`)
	})
})
const WITH_ONE_ATTRIBUTE = new Map<string, FileToValue[]>([
	[
		"mcc",
		[
			{ filePath: "root/app/file1", value: 100 },
			{ filePath: "root/app/file2", value: 84 },
			{ filePath: "root/app/file3", value: 122 }
		]
	]
])
const WITH_TWO_ATTRIBUTES = new Map<string, FileToValue[]>([
	["rloc", [{ filePath: "root/app/fileA", value: 12 }]],
	["comments", [{ filePath: "root/app/fileA", value: 14 }]]
])
const WITH_ONE_FILELESS_ATTRIBUTE = new Map<string, FileToValue[]>([["functions", []]])
