import { DeltaGenerator } from "./deltaGenerator"
import { TEST_DELTA_MAP_A, TEST_DELTA_MAP_B, TEST_DELTA_MAP_C, TEST_DELTA_MAP_D, TEST_DELTA_MAP_E, TEST_DELTA_MAP_F } from "./dataMocks"
import { CCFile, CodeMapNode, FileCount, NodeType } from "../codeCharta.model"
import { NodeDecorator } from "./nodeDecorator"
import { clone } from "./clone"
import { hierarchy } from "d3-hierarchy"

describe("deltaGenerator", () => {
	let fileA: CCFile
	let fileB: CCFile

	beforeEach(() => {
		fileA = clone(TEST_DELTA_MAP_A)
		fileB = clone(TEST_DELTA_MAP_B)
	})

	it("golden test", () => {
		NodeDecorator.decorateMapWithPathAttribute(fileA)
		NodeDecorator.decorateMapWithPathAttribute(fileB)

		fileA.map.children.push({
			name: "onlyA",
			type: NodeType.FOLDER,
			attributes: {},
			path: "/root/onlyA",
			isExcluded: false,
			isFlattened: false,
			children: [
				{
					name: "special",
					type: NodeType.FOLDER,
					attributes: {},
					path: "/root/onlyA/special",
					isExcluded: false,
					isFlattened: false,
					children: [
						{
							name: "unicorn",
							type: NodeType.FILE,
							attributes: { special: 42 },
							path: "/root/onlyA/special/unicorn",
							isExcluded: false,
							isFlattened: false
						},
						{
							name: "2ndUnicorn",
							type: NodeType.FILE,
							attributes: { special: 10 },
							path: "/root/onlyA/special/2ndunicorn",
							isExcluded: false,
							isFlattened: false
						}
					]
				}
			]
		})

		fileB.map.children.push({
			name: "onlyA",
			type: NodeType.FOLDER,
			attributes: {},
			path: "/root/onlyA",
			isExcluded: false,
			isFlattened: false,
			children: [
				{
					name: "special",
					type: NodeType.FOLDER,
					attributes: {},
					path: "/root/onlyA/special",
					isExcluded: false,
					isFlattened: false,
					children: [
						{
							name: "Narwal",
							type: NodeType.FILE,
							attributes: { monster: 666 },
							path: "/root/onlyA/special/Narwal",
							isExcluded: false,
							isFlattened: false
						}
					]
				}
			]
		})

		const result = DeltaGenerator.getDeltaFile(fileA, fileB)

		expect(result.map).toMatchSnapshot()
	})

	it("getDeltaFile should result in expected deltaFiles", () => {
		NodeDecorator.decorateMapWithPathAttribute(fileA)
		NodeDecorator.decorateMapWithPathAttribute(fileB)

		const result = DeltaGenerator.getDeltaFile(fileA, fileB)

		expect(result.map).toMatchSnapshot()
	})

	it("should detect added and removed files and add result to delta attributes", () => {
		// Here, "changed" means "added" or "removed"
		const actualAmountOfChangedFiles: Pick<FileCount, "added" | "removed"> = { added: 0, removed: 0 }
		const referenceMap = { ...TEST_DELTA_MAP_C }
		const comparisonMap = { ...TEST_DELTA_MAP_D }
		NodeDecorator.decorateMapWithPathAttribute(referenceMap)
		NodeDecorator.decorateMapWithPathAttribute(comparisonMap)

		const actualDeltaMap = DeltaGenerator.getDeltaFile(referenceMap, comparisonMap)

		for (const { data } of hierarchy(actualDeltaMap.map)) {
			actualAmountOfChangedFiles.added += data.fileCount.added
			actualAmountOfChangedFiles.removed += data.fileCount.removed
		}

		expect(actualAmountOfChangedFiles).toEqual({ added: 3, removed: 5 })
	})

	it("should detect value differences in common attributes of two files", () => {
		const fileA: CodeMapNode = { type: NodeType.FILE, attributes: { mcc: 5, functions: 0 }, name: "A" }
		const fileB: CodeMapNode = { type: NodeType.FILE, attributes: { mcc: 0 }, name: "A" }

		const result = DeltaGenerator["compareCommonAttributes"](fileA, fileB)

		expect(result).toEqual({ differenceExists: true })
	})

	it("should not detect differences when comparing a folder and a file", () => {
		const file: CodeMapNode = { type: NodeType.FOLDER, attributes: { mcc: 5 }, name: "one" }
		const folder: CodeMapNode = { type: NodeType.FILE, attributes: { functions: 0 }, name: "two" }

		const result = DeltaGenerator["compareCommonAttributes"](file, folder)

		expect(result).toEqual({ differenceExists: false })
	})

	it("should not detect differences when comparing two folders", () => {
		const folderA: CodeMapNode = { type: NodeType.FOLDER, attributes: { mcc: 12 }, name: "folder" }
		const folderB: CodeMapNode = { type: NodeType.FOLDER, attributes: { mcc: 7 }, name: "other folder" }

		const result = DeltaGenerator["compareCommonAttributes"](folderA, folderB)

		expect(result).toEqual({ differenceExists: false })
	})
	it("should not detect differences when comparing a file withouit attributes to another file", () => {
		const folderA: CodeMapNode = { type: NodeType.FILE, attributes: { mcc: 12 }, name: "folder" }
		const folderB: CodeMapNode = { type: NodeType.FILE, name: "other folder" }

		const result = DeltaGenerator["compareCommonAttributes"](folderA, folderB)

		expect(result).toEqual({ differenceExists: false })
	})

	it("should not detect differences when comparing a file to a clone with less attributes", () => {
		const file: CodeMapNode = { type: NodeType.FILE, attributes: { mcc: 5, functions: -3 }, name: "file" }
		const cloneWithLessAttributes: CodeMapNode = { type: NodeType.FILE, attributes: { mcc: 5 }, name: "smaller clone" }

		const result = DeltaGenerator["compareCommonAttributes"](file, cloneWithLessAttributes)

		expect(result).toEqual({ differenceExists: false })
	})
	it("should not detect differences when comparing two files which have no attributes in common", () => {
		const file: CodeMapNode = { type: NodeType.FILE, attributes: { mcc: 5, functions: 10 }, name: "file" }
		const cloneWithLessAttributes: CodeMapNode = { type: NodeType.FILE, attributes: { comments: 2, staticMethods: 7 }, name: "file" }

		const result = DeltaGenerator["compareCommonAttributes"](file, cloneWithLessAttributes)

		expect(result).toEqual({ differenceExists: false })
	})

	it.only("should detect files with metric changes and add result to delta attributes", () => {
		const actualAmountOfChangedFiles: Pick<FileCount, "metricsChanged"> = { metricsChanged: 0 }
		const referenceMap = { ...TEST_DELTA_MAP_E }
		const comparisonMap = { ...TEST_DELTA_MAP_F }
		NodeDecorator.decorateMapWithPathAttribute(referenceMap)
		NodeDecorator.decorateMapWithPathAttribute(comparisonMap)

		const actualDeltaMap = DeltaGenerator.getDeltaFile(referenceMap, comparisonMap)

		for (const { data } of hierarchy(actualDeltaMap.map)) {
			actualAmountOfChangedFiles.metricsChanged += data.fileCount.metricsChanged
		}

		expect(actualAmountOfChangedFiles).toEqual({ metricsChanged: 1 })
	})

	it("should sum exported file size of the comparison and reference File", () => {
		NodeDecorator.decorateMapWithPathAttribute(fileA)
		NodeDecorator.decorateMapWithPathAttribute(fileB)

		const result = DeltaGenerator.getDeltaFile(fileA, fileB)

		expect(result.fileMeta.exportedFileSize).toBe(fileA.fileMeta.exportedFileSize + fileB.fileMeta.exportedFileSize)
	})

	it("checking delta calculation between two attribute lists", () => {
		const a = { a: 100, b: 10, c: 1 }
		const b = { a: 110, b: 11, c: 0 }
		const c = { a: 110, b: 11, c: 0, d: 10 }
		const d = { a: 110, b: 11 }
		// eslint-disable-next-line unicorn/prevent-abbreviations
		const e = { d: 110, e: 11 }

		const ab = DeltaGenerator["getDeltaAttributeList"](a, b)
		expect(ab.a).toBe(b.a - a.a)
		expect(ab.b).toBe(b.b - a.b)
		expect(ab.c).toBe(b.c - a.c)

		const ac = DeltaGenerator["getDeltaAttributeList"](a, c)
		expect(ac.a).toBe(c.a - a.a)
		expect(ac.b).toBe(c.b - a.b)
		expect(ac.c).toBe(c.c - a.c)
		expect(ac.d).toBe(c.d)

		const ad = DeltaGenerator["getDeltaAttributeList"](a, d)
		expect(ad.a).toBe(d.a - a.a)
		expect(ad.b).toBe(d.b - a.b)
		expect(ad.c).toBe(-a.c)

		const ae = DeltaGenerator["getDeltaAttributeList"](a, e)
		expect(ae.a).toBe(-a.a)
		expect(ae.b).toBe(-a.b)
		expect(ae.c).toBe(-a.c)
		expect(ae.d).toBe(e.d)
		expect(ae.e).toBe(e.e)
	})
})
