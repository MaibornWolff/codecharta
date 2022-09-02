import { DeltaGenerator } from "./deltaGenerator"
import { DEFAULT_CC_FILE_MOCK, TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "./dataMocks"
import { CCFile, FileCount, NodeType } from "../codeCharta.model"
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

	it("getDeltaFile should result in expected deltaFiles when root is equal but Folders are merged (e.g. File1: 'root/' and File2: 'root/Parent Leaf')", () => {
		NodeDecorator.decorateMapWithPathAttribute(DELTA_MAP_MERGED_ROOT_NAME)
		NodeDecorator.decorateMapWithPathAttribute(DELTA_MAP_SINGLE_ROOT_NAME)

		const result = DeltaGenerator.getDeltaFile(DELTA_MAP_MERGED_ROOT_NAME, DELTA_MAP_SINGLE_ROOT_NAME)

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

	it("should detect files with metric changes and add result to delta attributes", () => {
		const actualAmountOfChangedFiles: Pick<FileCount, "changed"> = { changed: 0 }
		const referenceMap = { ...TEST_DELTA_MAP_E }
		const comparisonMap = { ...TEST_DELTA_MAP_F }
		NodeDecorator.decorateMapWithPathAttribute(referenceMap)
		NodeDecorator.decorateMapWithPathAttribute(comparisonMap)

		const actualDeltaMap = DeltaGenerator.getDeltaFile(referenceMap, comparisonMap)

		for (const { data } of hierarchy(actualDeltaMap.map)) {
			actualAmountOfChangedFiles.changed += data.fileCount.changed
		}

		expect(actualAmountOfChangedFiles).toEqual({ changed: 5 })
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

		const ab = DeltaGenerator["compareAttributeValues"](a, b).deltaList
		expect(ab.a).toBe(b.a - a.a)
		expect(ab.b).toBe(b.b - a.b)
		expect(ab.c).toBe(b.c - a.c)

		const ac = DeltaGenerator["compareAttributeValues"](a, c).deltaList
		expect(ac.a).toBe(c.a - a.a)
		expect(ac.b).toBe(c.b - a.b)
		expect(ac.c).toBe(c.c - a.c)
		expect(ac.d).toBe(c.d)

		const ad = DeltaGenerator["compareAttributeValues"](a, d).deltaList
		expect(ad.a).toBe(d.a - a.a)
		expect(ad.b).toBe(d.b - a.b)
		expect(ad.c).toBe(-a.c)

		const ae = DeltaGenerator["compareAttributeValues"](a, e).deltaList
		expect(ae.a).toBe(-a.a)
		expect(ae.b).toBe(-a.b)
		expect(ae.c).toBe(-a.c)
		expect(ae.d).toBe(e.d)
		expect(ae.e).toBe(e.e)
	})
})

export const TEST_DELTA_MAP_C: CCFile = {
	fileMeta: {
		...DEFAULT_CC_FILE_MOCK.fileMeta,
		fileName: "fileC",
		fileChecksum: "md5-delta-fileB"
	},
	map: {
		...DEFAULT_CC_FILE_MOCK.map,
		children: [
			{
				name: "big leaf",
				type: NodeType.FILE,
				attributes: { rloc: 20, functions: 10, mcc: 1 },
				link: "https://www.google.de"
			},
			{
				name: "additional leaf",
				type: NodeType.FILE,
				attributes: { rloc: 10, functions: 11, mcc: 5 },
				link: "https://www.google.de"
			},
			{
				name: "Parent Leaf",
				type: NodeType.FOLDER,
				attributes: {},
				children: [
					{
						name: "small leaf",
						type: NodeType.FILE,
						attributes: { rloc: 30, functions: 100, mcc: 100, more: 20 }
					},
					{
						name: "other small leaf",
						type: NodeType.FILE,
						attributes: { rloc: 70, functions: 1000 }
					},
					{
						name: "big leaf",
						type: NodeType.FILE,
						attributes: { rloc: 200, functions: 50, mcc: 30 },
						link: "https://www.google.de"
					}
				]
			}
		]
	},
	settings: DEFAULT_CC_FILE_MOCK.settings
}

export const TEST_DELTA_MAP_D: CCFile = {
	fileMeta: {
		...DEFAULT_CC_FILE_MOCK.fileMeta,
		fileName: "fileD",
		fileChecksum: "md5-delta-fileB"
	},
	map: {
		...DEFAULT_CC_FILE_MOCK.map,
		children: [
			{
				name: "D file 1",
				type: NodeType.FILE,
				attributes: { rloc: 400, functions: 12, mcc: 34 },
				link: "https://www.google.de"
			},
			{
				name: "D file 2",
				type: NodeType.FILE,
				attributes: { rloc: 230, functions: 14, mcc: 9 },
				link: "https://www.google.de"
			},
			{
				name: "D folder 1",
				type: NodeType.FOLDER,
				attributes: {},
				children: [
					{
						name: "D file 1.1",
						type: NodeType.FILE,
						attributes: { rloc: 400, functions: 30, mcc: 20, more: 20 }
					}
				]
			}
		]
	},
	settings: DEFAULT_CC_FILE_MOCK.settings
}

export const TEST_DELTA_MAP_E: CCFile = {
	fileMeta: {
		...DEFAULT_CC_FILE_MOCK.fileMeta,
		fileName: "fileE",
		fileChecksum: "md5-delta-fileE"
	},
	map: {
		...DEFAULT_CC_FILE_MOCK.map,
		children: [
			{ name: "File which exists in E but not in F", type: NodeType.FILE, attributes: { mcc: 12, rloc: 5 } },
			{ name: "Folder with different attributes", type: NodeType.FOLDER, attributes: { mcc: 12, rloc: 5 } },
			{
				name: "File with same rloc-value and either mcc or functions",
				type: NodeType.FILE,
				attributes: { rloc: 400, functions: 12 }
			},
			{
				name: "File without metric changes",
				type: NodeType.FILE,
				attributes: { rloc: 271 }
			},
			{
				name: "File with mcc in E, but no attributes in F",
				type: NodeType.FILE,
				attributes: { mcc: 2 }
			},
			{
				name: "File without attributes in E, but with functions in F",
				attributes: {},
				type: NodeType.FILE
			},
			{
				name: "File with mcc=0 in E, but no attributes in F, which does not count as difference",
				type: NodeType.FILE,
				attributes: { mcc: 0 }
			},
			{
				name: "File with mcc and rloc changes",
				type: NodeType.FILE,
				attributes: { mcc: 4, rloc: 7 }
			}
		]
	},
	settings: DEFAULT_CC_FILE_MOCK.settings
}
export const TEST_DELTA_MAP_F: CCFile = {
	fileMeta: {
		...DEFAULT_CC_FILE_MOCK.fileMeta,
		fileName: "fileF",
		fileChecksum: "md5-delta-fileF"
	},
	map: {
		...DEFAULT_CC_FILE_MOCK.map,
		children: [
			{ name: "Folder with different attributes", type: NodeType.FOLDER, attributes: { mcc: 120, rloc: 50 } },
			{
				name: "File with same rloc-value and either mcc or functions",
				type: NodeType.FILE,
				attributes: { rloc: 400, mcc: 7 }
			},
			{
				name: "File without metric changes",
				type: NodeType.FILE,
				attributes: { rloc: 271 }
			},
			{
				name: "File with mcc in E, but no attributes in F",
				type: NodeType.FILE,
				attributes: {}
			},
			{
				name: "File without attributes in E, but with functions in F",
				type: NodeType.FILE,
				attributes: { functions: 1 }
			},
			{
				name: "File with mcc=0 in E, but no attributes in F, which does not count as difference",
				type: NodeType.FILE,
				attributes: {}
			},
			{
				name: "File with mcc and rloc changes",
				type: NodeType.FILE,
				attributes: { mcc: 9001, rloc: 9002 } // its over 9000!!!
			}
		]
	},
	settings: DEFAULT_CC_FILE_MOCK.settings
}

const DELTA_MAP_SINGLE_ROOT_NAME: CCFile = {
	fileMeta: {
		...DEFAULT_CC_FILE_MOCK.fileMeta,
		fileName: "fileA",
		fileChecksum: "md5-delta-fileA"
	},
	map: {
		name: "root",
		type: NodeType.FOLDER,
		attributes: {},
		isExcluded: false,
		isFlattened: false,
		children: [
			{
				name: "Parent Leaf",
				type: NodeType.FOLDER,
				attributes: {},
				isExcluded: false,
				isFlattened: false,
				children: [
					{
						name: "small leaf",
						type: NodeType.FILE,
						attributes: { rloc: 1, functions: 10, mcc: 100 },
						isExcluded: false,
						isFlattened: false
					}
				]
			}
		]
	},
	settings: DEFAULT_CC_FILE_MOCK.settings
}

const DELTA_MAP_MERGED_ROOT_NAME: CCFile = {
	fileMeta: {
		...DEFAULT_CC_FILE_MOCK.fileMeta,
		fileName: "fileB",
		fileChecksum: "md5-delta-fileB"
	},
	map: {
		name: "root/Parent Leaf",
		type: NodeType.FOLDER,
		attributes: {},
		isExcluded: false,
		isFlattened: false,
		children: [
			{
				name: "small leaf",
				type: NodeType.FILE,
				attributes: { rloc: 100, functions: 10, mcc: 1 },
				isExcluded: false,
				isFlattened: false
			}
		]
	},
	settings: DEFAULT_CC_FILE_MOCK.settings
}
