import { FloorLabelHelper } from "./floorLabelHelper"
import { Node } from "../../../../codeCharta.model"

describe("FloorLabelHelper", () => {
    describe("getMapResolutionScaling", () => {
        function appendMapCanvas(mapCanvasWidth) {
            const fakeMapCanvas = document.createElement("canvas")
            fakeMapCanvas.width = fakeMapCanvas.height = mapCanvasWidth
            document.getElementById = jest.fn().mockReturnValue(fakeMapCanvas)
        }

        it("should not scale since map width is smaller than scaling threshold (four times the display width)", () => {
            appendMapCanvas(500)

            expect(FloorLabelHelper.getMapResolutionScaling(400)).toBe(1)
        })

        it("should scale since map width is greater than scaling threshold (four times the display width)", () => {
            appendMapCanvas(1000)

            expect(FloorLabelHelper.getMapResolutionScaling(5000)).toBeLessThan(1)
        })

        it("should not scale since map width is smaller than scaling threshold (four times the width of 2560px=FullHD+)", () => {
            appendMapCanvas(1000)

            expect(FloorLabelHelper.getMapResolutionScaling(400)).toBe(1)
        })

        it("should scale since map width is greater than scaling threshold (four times the width of 2560px=FullHD+)", () => {
            const fullHdPlusWidth = 2560
            appendMapCanvas(fullHdPlusWidth * 5)

            expect(FloorLabelHelper.getMapResolutionScaling(fullHdPlusWidth * 6)).toBeLessThan(1)
        })
    })

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
