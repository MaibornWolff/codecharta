import _ from "lodash"
import { FileExtensionCalculator, MetricDistribution } from "./fileExtensionCalculator"
import { BlacklistType, CodeMapNode, Settings } from "../codeCharta.model"
import { SETTINGS, VALID_NODE_WITH_PATH_AND_EXTENSION, VALID_NODE_WITHOUT_RLOC_METRIC } from "./dataMocks"
import { CodeMapHelper } from "./codeMapHelper"

describe("FileExtensionCalculator", () => {
	let map: CodeMapNode
	let settings: Settings

	let isBlacklistedOriginal

	beforeEach(() => {
		map = _.cloneDeep(VALID_NODE_WITH_PATH_AND_EXTENSION)
		settings = _.cloneDeep(SETTINGS)
	})

	function mockIsBlacklisted() {
		isBlacklistedOriginal = CodeMapHelper.isBlacklisted
		CodeMapHelper.isBlacklisted = jest.fn((node: CodeMapNode, blacklist, type) => {
			return node.path.includes(".java")
		})
	}

	function unmockIsBlacklisted() {
		CodeMapHelper.isBlacklisted = isBlacklistedOriginal
	}

	describe("getFileExtensionDistribution", () => {
		it("should get correct absolute distribution of file-extensions for given metric", () => {
			const expected: MetricDistribution[] = [
				{ fileExtension: "jpg", absoluteMetricValue: 130, relativeMetricValue: null, color: null },
				{ fileExtension: "java", absoluteMetricValue: 162, relativeMetricValue: null, color: null },
				{ fileExtension: "json", absoluteMetricValue: 70, relativeMetricValue: null, color: null },
				{ fileExtension: "None", absoluteMetricValue: 15, relativeMetricValue: null, color: null }
			]

			const result: MetricDistribution[] = FileExtensionCalculator["getAbsoluteDistribution"](map, "RLOC", [])

			expect(result).toEqual(expected)
		})

		it("should get correct absolute distribution of file-extensions for given metric with hidden node", () => {
			const blacklistItem = { path: map.children[0].path, type: BlacklistType.hide }
			settings.fileSettings.blacklist.push(blacklistItem)

			const expected: MetricDistribution[] = [
				{ fileExtension: "jpg", absoluteMetricValue: 130, relativeMetricValue: null, color: null },
				{ fileExtension: "java", absoluteMetricValue: 162, relativeMetricValue: null, color: null },
				{ fileExtension: "json", absoluteMetricValue: 70, relativeMetricValue: null, color: null },
				{ fileExtension: "None", absoluteMetricValue: 15, relativeMetricValue: null, color: null }
			]

			const result: MetricDistribution[] = FileExtensionCalculator["getAbsoluteDistribution"](
				map,
				"RLOC",
				settings.fileSettings.blacklist
			)

			expect(result).toEqual(expected)
		})

		it("should get correct absolute distribution of file-extensions for given metric with excluded node", () => {
			const blacklistItem = { path: map.children[0].path, type: BlacklistType.exclude }
			settings.fileSettings.blacklist.push(blacklistItem)

			const expected: MetricDistribution[] = [
				{ fileExtension: "java", absoluteMetricValue: 162, relativeMetricValue: null, color: null },
				{ fileExtension: "jpg", absoluteMetricValue: 30, relativeMetricValue: null, color: null },
				{ fileExtension: "json", absoluteMetricValue: 70, relativeMetricValue: null, color: null },
				{ fileExtension: "None", absoluteMetricValue: 15, relativeMetricValue: null, color: null }
			]

			const result: MetricDistribution[] = FileExtensionCalculator["getAbsoluteDistribution"](
				map,
				"RLOC",
				settings.fileSettings.blacklist
			)

			expect(result).toEqual(expected)
		})

		it("should get correct absolute distribution of file-extensions for given metric with excluded path", () => {
			mockIsBlacklisted()
			const blacklistItem = { path: "*.java", type: BlacklistType.exclude }
			settings.fileSettings.blacklist.push(blacklistItem)

			const expected: MetricDistribution[] = [
				{ fileExtension: "jpg", absoluteMetricValue: 130, relativeMetricValue: null, color: null },
				{ fileExtension: "json", absoluteMetricValue: 70, relativeMetricValue: null, color: null },
				{ fileExtension: "None", absoluteMetricValue: 15, relativeMetricValue: null, color: null }
			]

			const result: MetricDistribution[] = FileExtensionCalculator["getAbsoluteDistribution"](
				map,
				"RLOC",
				settings.fileSettings.blacklist
			)

			expect(result).toEqual(expected)

			unmockIsBlacklisted()
		})

		it("should get correct relative distribution of file-extensions for given metric", () => {
			const expected: MetricDistribution[] = [
				{ fileExtension: "java", absoluteMetricValue: 162, relativeMetricValue: 42.97082228116711, color: null },
				{ fileExtension: "jpg", absoluteMetricValue: 130, relativeMetricValue: 34.48275862068966, color: null },
				{ fileExtension: "json", absoluteMetricValue: 70, relativeMetricValue: 18.56763925729443, color: null },
				{ fileExtension: "other", absoluteMetricValue: 15, relativeMetricValue: 3.978779840848806, color: "#676867" }
			]

			const result: MetricDistribution[] = FileExtensionCalculator.getMetricDistribution(map, "RLOC", [])

			expect(result).toEqual(expected)
		})

		it("should get correct get Array with just a None Attribute, if no Extension is found for the Metric", () => {
			map = VALID_NODE_WITHOUT_RLOC_METRIC

			const expected: MetricDistribution[] = [
				{ fileExtension: "None", absoluteMetricValue: null, relativeMetricValue: 100, color: "#676867" }
			]

			const result: MetricDistribution[] = FileExtensionCalculator.getMetricDistribution(map, "RLOC", [])

			expect(result).toEqual(expected)
		})

		it("should get correct distribution of file-extensions for given metric using other-grouping", () => {
			const additionalChildren: CodeMapNode[] = [
				{ name: "child1.txt", type: "File", path: "/root/child1.txt", attributes: { RLOC: 2 } },
				{ name: "child2.kt", type: "File", path: "/root/child2.kt", attributes: { RLOC: 4 } },
				{ name: "child3.ts", type: "File", path: "/root/child3.ts", attributes: { RLOC: 6 } },
				{ name: "child4.xml", type: "File", path: "/root/child4.xml", attributes: { RLOC: 8 } }
			]
			const expected: MetricDistribution[] = [
				{ fileExtension: "java", absoluteMetricValue: 162, relativeMetricValue: 40.80604534005038, color: null },
				{ fileExtension: "jpg", absoluteMetricValue: 130, relativeMetricValue: 32.7455919395466, color: null },
				{ fileExtension: "json", absoluteMetricValue: 70, relativeMetricValue: 17.632241813602015, color: null },
				{ fileExtension: "None", absoluteMetricValue: 15, relativeMetricValue: 3.7783375314861463, color: null },
				{ fileExtension: "xml", absoluteMetricValue: 8, relativeMetricValue: 2.0151133501259446, color: null },
				{ fileExtension: "other", absoluteMetricValue: 12, relativeMetricValue: 3.0226700251889165, color: "#676867" }
			]
			map.children.push(...additionalChildren)
			FileExtensionCalculator["OTHER_GROUP_THRESHOLD_VALUE"] = 95

			const result: MetricDistribution[] = FileExtensionCalculator.getMetricDistribution(map, "RLOC", [])

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
