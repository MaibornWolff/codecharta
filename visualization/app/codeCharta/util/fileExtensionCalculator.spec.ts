import { FileExtensionCalculator, MetricDistribution } from "./fileExtensionCalculator"
import { CodeMapNode } from "../codeCharta.model"
import { VALID_NODE_WITH_PATH_AND_EXTENSION } from "./dataMocks"

describe("FileExtensionCalculator", () => {
	let map: CodeMapNode

	beforeEach(() => {
		map = VALID_NODE_WITH_PATH_AND_EXTENSION
	})

	describe("getFileExtensionDistribution", () => {
		it("should get correct absolute distribution of file-extensions for given metric", () => {
			const result: MetricDistribution[] = FileExtensionCalculator["getAbsoluteDistribution"](map, "RLOC")
			const expected: MetricDistribution[] = [
				{ fileExtension: "jpg", absoluteMetricValue: 130, relativeMetricValue: null, color: null },
				{ fileExtension: "java", absoluteMetricValue: 162, relativeMetricValue: null, color: null },
				{ fileExtension: "json", absoluteMetricValue: 70, relativeMetricValue: null, color: null },
				{ fileExtension: "None", absoluteMetricValue: 15, relativeMetricValue: null, color: null }
			]
			expect(result).toEqual(expected)
		})

		it("should get correct relative distribution of file-extensions for given metric", () => {
			const result: MetricDistribution[] = FileExtensionCalculator.getMetricDistribution(map, "RLOC")
			const expected: MetricDistribution[] = [
				{ fileExtension: "java", absoluteMetricValue: 162, relativeMetricValue: 42.97082228116711, color: null },
				{ fileExtension: "jpg", absoluteMetricValue: 130, relativeMetricValue: 34.48275862068966, color: null },
				{ fileExtension: "json", absoluteMetricValue: 70, relativeMetricValue: 18.56763925729443, color: null },
				{ fileExtension: "None", absoluteMetricValue: 15, relativeMetricValue: 3.978779840848806, color: null }
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
			expect(result).toEqual("None")
		})
	})
})
