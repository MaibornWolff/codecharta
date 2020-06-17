import _ from "lodash"
import { FileExtensionCalculator, MetricDistribution } from "./fileExtensionCalculator"
import { BlacklistType, CodeMapNode, NodeType } from "../codeCharta.model"
import { VALID_NODE_WITH_PATH_AND_EXTENSION, VALID_NODE_WITHOUT_RLOC_METRIC, setIsBlacklisted } from "./dataMocks"
import { HSL } from "./color/hsl"

describe("FileExtensionCalculator", () => {
	let map: CodeMapNode

	beforeEach(() => {
		map = _.cloneDeep(VALID_NODE_WITH_PATH_AND_EXTENSION)
	})

	describe("getFileExtensionDistribution", () => {
		it("should get correct absolute distribution of file-extensions for given metric", () => {
			const expected: MetricDistribution[] = [
				{ fileExtension: "jpg", absoluteMetricValue: 130, relativeMetricValue: null, color: null },
				{ fileExtension: "java", absoluteMetricValue: 162, relativeMetricValue: null, color: null },
				{ fileExtension: "json", absoluteMetricValue: 70, relativeMetricValue: null, color: null },
				{ fileExtension: "None", absoluteMetricValue: 15, relativeMetricValue: null, color: null }
			]

			const result: MetricDistribution[] = FileExtensionCalculator["getAbsoluteDistribution"](map, "rloc")

			expect(result).toEqual(expected)
		})

		it("should get correct absolute distribution of file-extensions for given metric with hidden node", () => {
			setIsBlacklisted([map.children[0].path], map, BlacklistType.flatten)

			const expected: MetricDistribution[] = [
				{ fileExtension: "jpg", absoluteMetricValue: 130, relativeMetricValue: null, color: null },
				{ fileExtension: "java", absoluteMetricValue: 162, relativeMetricValue: null, color: null },
				{ fileExtension: "json", absoluteMetricValue: 70, relativeMetricValue: null, color: null },
				{ fileExtension: "None", absoluteMetricValue: 15, relativeMetricValue: null, color: null }
			]

			const result: MetricDistribution[] = FileExtensionCalculator["getAbsoluteDistribution"](map, "rloc")

			expect(result).toEqual(expected)
		})

		it("should get correct absolute distribution of file-extensions for given metric with excluded node", () => {
			setIsBlacklisted([map.children[0].path], map, BlacklistType.exclude)

			const expected: MetricDistribution[] = [
				{ fileExtension: "java", absoluteMetricValue: 162, relativeMetricValue: null, color: null },
				{ fileExtension: "jpg", absoluteMetricValue: 30, relativeMetricValue: null, color: null },
				{ fileExtension: "json", absoluteMetricValue: 70, relativeMetricValue: null, color: null },
				{ fileExtension: "None", absoluteMetricValue: 15, relativeMetricValue: null, color: null }
			]

			const result: MetricDistribution[] = FileExtensionCalculator["getAbsoluteDistribution"](map, "rloc")

			expect(result).toEqual(expected)
		})

		it("should get correct absolute distribution of file-extensions for given metric with excluded path", () => {
			setIsBlacklisted(["/root/another big leaf.java", "/root/Parent Leaf/another leaf.java"], map, BlacklistType.exclude)

			const expected: MetricDistribution[] = [
				{ fileExtension: "jpg", absoluteMetricValue: 130, relativeMetricValue: null, color: null },
				{ fileExtension: "json", absoluteMetricValue: 70, relativeMetricValue: null, color: null },
				{ fileExtension: "None", absoluteMetricValue: 15, relativeMetricValue: null, color: null }
			]

			const result: MetricDistribution[] = FileExtensionCalculator["getAbsoluteDistribution"](map, "rloc")

			expect(result).toEqual(expected)
		})

		it("should get correct relative distribution of file-extensions for given metric", () => {
			const expected: MetricDistribution[] = [
				{
					fileExtension: "java",
					absoluteMetricValue: 162,
					relativeMetricValue: 42.97082228116711,
					color: null
				},
				{ fileExtension: "jpg", absoluteMetricValue: 130, relativeMetricValue: 34.48275862068966, color: null },
				{ fileExtension: "json", absoluteMetricValue: 70, relativeMetricValue: 18.56763925729443, color: null },
				{
					fileExtension: "None",
					absoluteMetricValue: 15,
					relativeMetricValue: 3.978779840848806,
					color: null
				}
			]

			const result: MetricDistribution[] = FileExtensionCalculator.getMetricDistribution(map, "rloc")

			expect(result).toEqual(expected)
		})

		it("should get correct get Array with just a None Attribute, if no Extension is found for the Metric", () => {
			map = VALID_NODE_WITHOUT_RLOC_METRIC

			const expected: MetricDistribution[] = [
				{ fileExtension: "None", absoluteMetricValue: null, relativeMetricValue: 100, color: "#676867" }
			]

			const result: MetricDistribution[] = FileExtensionCalculator.getMetricDistribution(map, "rloc")

			expect(result).toEqual(expected)
		})

		it("should get correct distribution of file-extensions for given metric using other-grouping", () => {
			const additionalChildren: CodeMapNode[] = [
				{
					name: "child1.txt",
					type: NodeType.FILE,
					path: "/root/child1.txt",
					attributes: { rloc: 2 },
					isExcluded: false,
					isFlattened: false
				},
				{
					name: "child2.kt",
					type: NodeType.FILE,
					path: "/root/child2.kt",
					attributes: { rloc: 4 },
					isExcluded: false,
					isFlattened: false
				},
				{
					name: "child3.ts",
					type: NodeType.FILE,
					path: "/root/child3.ts",
					attributes: { rloc: 6 },
					isExcluded: false,
					isFlattened: false
				},
				{
					name: "child4.xml",
					type: NodeType.FILE,
					path: "/root/child4.xml",
					attributes: { rloc: 8 },
					isExcluded: false,
					isFlattened: false
				}
			]
			const expected: MetricDistribution[] = [
				{
					fileExtension: "java",
					absoluteMetricValue: 162,
					relativeMetricValue: 40.80604534005038,
					color: null
				},
				{ fileExtension: "jpg", absoluteMetricValue: 130, relativeMetricValue: 32.7455919395466, color: null },
				{
					fileExtension: "json",
					absoluteMetricValue: 70,
					relativeMetricValue: 17.632241813602015,
					color: null
				},
				{
					fileExtension: "None",
					absoluteMetricValue: 15,
					relativeMetricValue: 3.7783375314861463,
					color: null
				},
				{ fileExtension: "xml", absoluteMetricValue: 8, relativeMetricValue: 2.0151133501259446, color: null },
				{
					fileExtension: "other",
					absoluteMetricValue: 12,
					relativeMetricValue: 3.0226700251889165,
					color: "#676867"
				}
			]
			map.children.push(...additionalChildren)
			FileExtensionCalculator["OTHER_GROUP_THRESHOLD_VALUE"] = 2.0

			const result: MetricDistribution[] = FileExtensionCalculator.getMetricDistribution(map, "rloc")

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

	describe("hashCode => numberToHashCode", () => {
		it("should generate a hsl-color for file extension", () => {
			const hashCode = FileExtensionCalculator.hashCode("ts")
			const result = FileExtensionCalculator.numberToHsl(hashCode)

			expect(result).toEqual(new HSL(111, 40, 50))
		})
	})
})
