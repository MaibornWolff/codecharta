import { FileExtensionCalculator, FileExtensionDistribution } from "./fileExtensionCalculator"
import { CodeMapNode } from "../codeCharta.model"
import { VALID_NODE_WITH_PATH_AND_EXTENSION } from "./dataMocks"

describe("FileExtensionCalculator", () => {
	let map: CodeMapNode

	beforeEach(() => {
		map = VALID_NODE_WITH_PATH_AND_EXTENSION
	})

	describe("getFileExtensionDistribution", () => {
		it("should get correct distribution of file-extensions with for metric", () => {
			const metrics = ["RLOC", "MCC"]
			const result: FileExtensionDistribution[] = FileExtensionCalculator.getFileExtensionDistribution(map, metrics)
			const expected: FileExtensionDistribution[] = [
				{
					metric: "RLOC",
					distribution: {
						jpg: 130,
						java: 162,
						json: 70,
						none: 15
					}
				},
				{
					metric: "MCC",
					distribution: {
						jpg: 101,
						java: 47,
						json: 10,
						none: 33
					}
				}
			]
			expect(result).toEqual(expected)
		})
	})

	describe("estimateFileExtension", () => {
		it("should return correct lower-cased file extension", () => {
			const fileName: string = "fileName.JAVA"
			const result: string = FileExtensionCalculator["estimateFileExtension"](fileName)
			expect(result).toEqual("java")
		})

		it("should return correct file extension when filename contains multiple points", () => {
			const fileName: string = "prefix.name.suffix.json"
			const result: string = FileExtensionCalculator["estimateFileExtension"](fileName)
			expect(result).toEqual("json")
		})

		it("should return 'none' as extension, as there does not exist any", () => {
			const fileName: string = "name_without_extension"
			const result: string = FileExtensionCalculator["estimateFileExtension"](fileName)
			expect(result).toEqual("none")
		})
	})
})
