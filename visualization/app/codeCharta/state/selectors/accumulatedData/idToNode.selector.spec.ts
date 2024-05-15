import { VALID_NODES_WITH_ID } from "../../../util/dataMocks"
import { _calculateIdToNode } from "./idToNode.selector"

describe("idToNodeSelector", () => {
    it("should return an empty Map if there is no unifiedMapNode", () => {
        expect(_calculateIdToNode({ unifiedMapNode: undefined }).size).toBe(0)
    })

    it("should include root node and its children", () => {
        const idToNode = _calculateIdToNode({ unifiedMapNode: VALID_NODES_WITH_ID })
        expect(idToNode.size).toBe(2)
        expect(idToNode.get(0)).toEqual(VALID_NODES_WITH_ID)
        expect(idToNode.get(1)).toEqual(VALID_NODES_WITH_ID.children[0])
    })
})
