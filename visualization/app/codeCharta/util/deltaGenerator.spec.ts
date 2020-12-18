import { DeltaGenerator } from "./deltaGenerator"
import { TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "./dataMocks"
import { CCFile, NodeType } from "../codeCharta.model"
import { NodeDecorator } from "./nodeDecorator"
import { clone } from "./clone"

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

	it("should sum the size of the comparison and reference File", () => {
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
