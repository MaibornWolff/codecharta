import { Node } from "../../../model/codeCharta.model"
import { FloorLabelHelper } from "./floorLabelHelper"

describe("FloorLabelHelper", () => {
    describe("isLabelNode", () => {
        function createNode(isLeaf: boolean, mapNodeDepth?: number): Node {
            return {
                attributes: undefined,
                color: "",
                depth: 0,
                edgeAttributes: {},
                flat: false,
                height: 0,
                heightDelta: 0,
                id: 0,
                incomingEdgePoint: undefined,
                isLeaf,
                length: 0,
                link: "",
                mapNodeDepth,
                markingColor: undefined,
                name: "",
                outgoingEdgePoint: undefined,
                path: "",
                visible: false,
                width: 0,
                x0: 0,
                y0: 0,
                z0: 0
            }
        }

        it("should return true for floor label nodes)", () => {
            const nodeLevel0 = createNode(false, 0)
            expect(FloorLabelHelper.isLabelNode(nodeLevel0)).toBe(true)

            const nodeLevel1 = createNode(false, 1)
            expect(FloorLabelHelper.isLabelNode(nodeLevel1)).toBe(true)

            const nodeLevel2 = createNode(false, 2)
            expect(FloorLabelHelper.isLabelNode(nodeLevel2)).toBe(true)
        })

        it("should return false for other nodes)", () => {
            const node1 = createNode(true, 0)
            expect(FloorLabelHelper.isLabelNode(node1)).toBe(false)

            const node2 = createNode(false, 3)
            expect(FloorLabelHelper.isLabelNode(node2)).toBe(false)

            const node3 = createNode(true)
            expect(FloorLabelHelper.isLabelNode(node3)).toBe(false)
        })
    })
})
