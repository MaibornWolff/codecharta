import { VALID_NODE_WITH_PATH } from "./dataMocks"
import { CodeMapNode, NodeType } from "../codeCharta.model"
import { MapBuilder } from "./mapBuilder"

describe("mapBuilder", () => {
	let rootNode: CodeMapNode

	beforeEach(() => {
		rootNode = VALID_NODE_WITH_PATH
	})

	it("createCodeMapFromHashMap", () => {
		const hashMap: Map<string, CodeMapNode> = new Map([
			[rootNode.path, rootNode],
			[rootNode.children[0].path, rootNode.children[0]],
			[rootNode.children[1].path, rootNode.children[1]],
			[rootNode.children[1].children[0].path, rootNode.children[1].children[0]],
			[rootNode.children[1].children[1].path, rootNode.children[1].children[1]],
			[rootNode.children[1].children[2].path, rootNode.children[1].children[2]]
		])
		expect(MapBuilder.createCodeMapFromHashMap(hashMap)).toMatchSnapshot()
	})

	it("getParentPath", () => {
		expect(MapBuilder["getParentPath"]("/root/nodeA")).toEqual("/root")
		expect(MapBuilder["getParentPath"]("/root/nodeA/nodeB")).toEqual("/root/nodeA")
	})

	describe("findNode", () => {
		it("should find child node", () => {
			const expected: CodeMapNode = {
				name: "big leaf",
				type: NodeType.FILE,
				path: "/root/big leaf",
				children: [],
				attributes: { rloc: 100, functions: 10, mcc: 1 },
				link: "http://www.google.de"
			}
			expect(MapBuilder["findNode"](rootNode, "/root/big leaf")).toEqual(expected)
		})

		it("should find grand-child node", () => {
			const expected: CodeMapNode = {
				name: "other small leaf",
				type: NodeType.FILE,
				path: "/root/Parent Leaf/other small leaf",
				children: [],
				attributes: { rloc: 70, functions: 1000, mcc: 10 }
			}
			expect(MapBuilder["findNode"](rootNode, "/root/Parent Leaf/other small leaf")).toEqual(expected)
		})
	})
})
