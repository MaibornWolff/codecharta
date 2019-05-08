import { FileExtensionCalculator, MetricDistribution } from "./fileExtensionCalculator"
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
			const result: MetricDistribution[] = FileExtensionCalculator.getAbsoluteFileExtensionDistribution(map, metrics)
			const expected: MetricDistribution[] = [
				{
					metric: "RLOC",
					distribution: [
						{fileExtension: "jpg", absoluteMetricValue: 130, relativeMetricValue: null, color: null},
						{fileExtension: "java", absoluteMetricValue: 162, relativeMetricValue: null, color: null},
						{fileExtension: "json", absoluteMetricValue: 70, relativeMetricValue: null, color: null},
						{fileExtension: "none", absoluteMetricValue: 15, relativeMetricValue: null, color: null},
					]
				},
				{
					metric: "MCC",
					distribution: [
						{fileExtension: "jpg", absoluteMetricValue: 101, relativeMetricValue: null, color: null},
						{fileExtension: "java", absoluteMetricValue: 47, relativeMetricValue: null, color: null},
						{fileExtension: "json", absoluteMetricValue: 10, relativeMetricValue: null, color: null},
						{fileExtension: "none", absoluteMetricValue: 33, relativeMetricValue: null, color: null},
					]
				}
			]
			expect(result).toEqual(expected)
		})

		it("should get correct distribution of file-extensions with for metric", () => {
			const metrics = ["RLOC"]
			const result: MetricDistribution[] = FileExtensionCalculator.getRelativeFileExtensionDistribution(map, metrics)
			const expected: MetricDistribution[] = [
				{
					metric: "RLOC",
					distribution: [
						{fileExtension: "java", absoluteMetricValue: 162, relativeMetricValue: 42.97, color: null},
						{fileExtension: "jpg", absoluteMetricValue: 130, relativeMetricValue: 34.48, color: null},
						{fileExtension: "json", absoluteMetricValue: 70, relativeMetricValue: 18.57, color: null},
						{fileExtension: "none", absoluteMetricValue: 15, relativeMetricValue: 3.98, color: null},
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
