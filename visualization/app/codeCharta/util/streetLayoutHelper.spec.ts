import { CodeMapNode, NodeType } from "../codeCharta.model"
import { StreetLayoutHelper } from "./streetLayoutHelper"

describe("StreetLayoutHelper", () => {
	describe("cound file descendants", () => {
		let innerNode: CodeMapNode
		let leafNode: CodeMapNode

		beforeEach(() => {
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

			it("should have no file descendants", () => {
				innerNode.children = []
				const fileDescendants = StreetLayoutHelper.countFileDescendants(innerNode)
				expect(fileDescendants).toBe(0)
			})

			it("should have one file descendant", () => {
				const fileDescendants = StreetLayoutHelper.countFileDescendants(innerNode)
				expect(fileDescendants).toBe(1)
			})

			it("should have 3 file descendats (2 direct, 1 indirect)", () => {
				innerNode.children = [innerNode, leafNode, leafNode]
				const fileDescendants = StreetLayoutHelper.countFileDescendants(innerNode)
				expect(fileDescendants).toBe(3)
			})
		})
	})
})
