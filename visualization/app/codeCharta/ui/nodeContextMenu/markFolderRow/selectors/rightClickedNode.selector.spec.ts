import { CodeMapBuilding } from "../../../codeMap/rendering/codeMapBuilding"
import { _getNode } from "./rightClickedNode.selector"

describe("rightClickedNodeSelector's _getNode", () => {
	it("should return null when no building was right clicked on", () => {
		expect(_getNode(new Map(), null)).toBe(null)
	})

	it("should return node", () => {
		const node = { id: 1 }
		const codeMapBuilding = { node } as CodeMapBuilding
		const idToBuilding = new Map([[1, codeMapBuilding]])
		expect(_getNode(idToBuilding, { nodeId: 1 })).toBe(node)
	})
})
