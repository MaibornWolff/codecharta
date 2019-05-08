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
					distribution: [
						{fileExtension: "jpg", metricValue: 130, color: null},
						{fileExtension: "java", metricValue: 162, color: null},
						{fileExtension: "json", metricValue: 70, color: null},
						{fileExtension: "none", metricValue: 15, color: null},
					]
				},
				{
					metric: "MCC",
					distribution: [
						{fileExtension: "jpg", metricValue: 101, color: null},
						{fileExtension: "java", metricValue: 47, color: null},
						{fileExtension: "json", metricValue: 10, color: null},
						{fileExtension: "none", metricValue: 33, color: null},
					]
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
