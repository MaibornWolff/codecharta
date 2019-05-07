import {VALID_NODE_WITH_PATH} from "./dataMocks";
import {CodeMapNode} from "../codeCharta.model";
import {MapBuilder} from "./mapBuilder";

describe("mapBuilder", () => {

	let rootNode: CodeMapNode

	beforeEach(() => {
		rootNode = VALID_NODE_WITH_PATH
	});

	it("createCodeMapFromHashMap", () => {
		const hashMap: Map<string, CodeMapNode> = new Map([
			[rootNode.path, rootNode],
			[rootNode.children[0].path, rootNode.children[0]],
			[rootNode.children[1].path, rootNode.children[1]],
			[rootNode.children[1].children[0].path, rootNode.children[1].children[0]],
			[rootNode.children[1].children[1].path, rootNode.children[1].children[1]],
			[rootNode.children[1].children[2].path, rootNode.children[1].children[2]],
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
				type: "File",
				path: "/root/big leaf",
				children: [],
				attributes: { RLOC: 100, Functions: 10, MCC: 1 },
				link: "http://www.google.de"
			}
			expect(MapBuilder["findNode"](rootNode, "/root/big leaf")).toEqual(expected)
		})

		it("should find grand-child node", () => {
			const expected: CodeMapNode = {
				name: "other small leaf",
				type: "File",
				path: "/root/Parent Leaf/other small leaf",
				children: [],
				attributes: { RLOC: 70, Functions: 1000, MCC: 10 }
			}
			expect(MapBuilder["findNode"](rootNode, "/root/Parent Leaf/other small leaf")).toEqual(expected)
		})
	})
});

