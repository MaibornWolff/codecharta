import { CodeMapNode, NodeType } from "../../../codeCharta.model"
import { DEFAULT_STATE, VALID_NODE } from "../../dataMocks"
import { TreeMapHelper } from "../treeMapLayout/treeMapHelper"
import { buildNodeFrom, StreetViewHelper } from "./streetViewHelper"

describe("StreetViewHelper", () => {
	let leafNode: CodeMapNode
	let innerNode: CodeMapNode

	function withMockedStreeTMapHelper() {
		TreeMapHelper.isNodeFlat = jest.fn().mockReturnValue(false)
		TreeMapHelper.getHeightValue = jest.fn().mockReturnValue(20)
	}

	beforeEach(() => {
		withMockedStreeTMapHelper()
		leafNode = {
			name: "Anode",
			path: "/root/Anode",
			type: NodeType.FILE,
			attributes: { rloc: 100 },
			edgeAttributes: { pairingRate: { incoming: 42, outgoing: 23 } }
		} as CodeMapNode

		innerNode = {
			name: "root",
			path: "/root",
			type: NodeType.FOLDER,
			attributes: {},
			children: [leafNode],
			edgeAttributes: { pairingRate: { incoming: 42, outgoing: 23 } }
		} as CodeMapNode
	})

	describe("calculateSize", () => {
		it("should be the node's attribute size", () => {
			const size = StreetViewHelper.calculateSize(leafNode, "rloc")
			expect(size).toBe(leafNode.attributes["rloc"])
		})
	})

	describe("mergeDirectories", () => {
		it("should merge directory names", () => {
			// TODO test needs to be corrected
			//const node = StreetViewHelper.mergeDirectories(innerNode, "rloc")
			//expect(node.name).toBe(innerNode.name + "/" + leafNode.name)
		})

		it("should not merge directory names", () => {
			const node = StreetViewHelper.mergeDirectories(innerNode, "rloc")
			expect(node.name).toBe(innerNode.name)
		})
	})

	describe("buildNodeFrom", () => {
		const DEFAULT_VALUE = 0.000000000001
		const FOLDER_HEIGHT = 2
		it("should default to the default size when node.rect is undefined or null(root when all is excluded)", () => {
			const result = buildNodeFrom(VALID_NODE, 5, 10, DEFAULT_STATE, false)
			expect(result.length).toBe(DEFAULT_VALUE)
			expect(result.x0).toBe(DEFAULT_VALUE)
			expect(result.y0).toBe(DEFAULT_VALUE)
			expect(result.width).toBe(DEFAULT_VALUE)
			expect(result.z0).toBe(FOLDER_HEIGHT)
		})
	})
})
