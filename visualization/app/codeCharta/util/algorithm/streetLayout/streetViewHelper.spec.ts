import { CodeMapNode, NodeType } from "../../../codeCharta.model"
import { StreetViewHelper } from "./streetViewHelper"

describe("StreetViewHelper", () => {
    let leafNode: CodeMapNode
    let innerNode: CodeMapNode

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
})
