import _ from "lodash"
import { DeltaGenerator } from "./deltaGenerator"
import { TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "./dataMocks"
import { CCFile, NodeType } from "../codeCharta.model"
import { NodeDecorator } from "./nodeDecorator"

describe("deltaGenerator", () => {
	let fileA: CCFile
	let fileB: CCFile

	beforeEach(() => {
		fileA = _.cloneDeep(TEST_DELTA_MAP_A)
		fileB = _.cloneDeep(TEST_DELTA_MAP_B)
	})

	it("golden test", () => {
		NodeDecorator.preDecorateFile(fileA)
		NodeDecorator.preDecorateFile(fileB)

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

		expect(result.map.children[0].children[0].children[0].attributes["monster"]).toBe(666)
		expect(result.map.children[0].children[0].children[0].deltas["monster"]).toBe(666)
		expect(result.map.children[0].children[0].children[1].attributes["special"]).toBe(undefined)
		expect(result.map.children[0].children[0].children[1].deltas["special"]).toBe(-42)
	})

	it("additionalLeaf from fileB should exist in a after calling getDeltaFile, metrics should be 0", () => {
		NodeDecorator.preDecorateFile(fileA)
		NodeDecorator.preDecorateFile(fileB)

		const result = DeltaGenerator.getDeltaFile(fileA, fileB)

		expect(result.map.children[2].name).toBe("additional leaf")

		expect(result.map.children[2].attributes.rloc).toBe(10)
	})

	it("getDeltaFile should result in expected deltaFiles", () => {
		NodeDecorator.preDecorateFile(fileA)
		NodeDecorator.preDecorateFile(fileB)

		const result = DeltaGenerator.getDeltaFile(fileA, fileB)

		expect(result.map.children[0].deltas["rloc"]).toBe(-80)
		expect(result.map.children[1].children[1].deltas["more"]).toBe(20)
		expect(result.map.children[1].children[2].deltas["mcc"]).toBe(-10)
		expect(result.map.children[2].deltas["rloc"]).toBe(10)
	})

	it("checking delta calculation between two attribute lists", () => {
		const a = { a: 100, b: 10, c: 1 }
		const b = { a: 110, b: 11, c: 0 }
		const c = { a: 110, b: 11, c: 0, d: 10 }
		const d = { a: 110, b: 11 }
		const e = { d: 110, e: 11 }

		const ab: any = DeltaGenerator["getDeltaAttributeList"](a, b)
		expect(ab.a).toBe(b.a - a.a)
		expect(ab.b).toBe(b.b - a.b)
		expect(ab.c).toBe(b.c - a.c)

		const ac: any = DeltaGenerator["getDeltaAttributeList"](a, c)
		expect(ac.a).toBe(c.a - a.a)
		expect(ac.b).toBe(c.b - a.b)
		expect(ac.c).toBe(c.c - a.c)
		expect(ac.d).toBe(c.d)

		const ad: any = DeltaGenerator["getDeltaAttributeList"](a, d)
		expect(ad.a).toBe(d.a - a.a)
		expect(ad.b).toBe(d.b - a.b)
		expect(ad.c).toBe(-a.c)

		const ae: any = DeltaGenerator["getDeltaAttributeList"](a, e)
		expect(ae.a).toBe(-a.a)
		expect(ae.b).toBe(-a.b)
		expect(ae.c).toBe(-a.c)
		expect(ae.d).toBe(e.d)
		expect(ae.e).toBe(e.e)
	})
})
