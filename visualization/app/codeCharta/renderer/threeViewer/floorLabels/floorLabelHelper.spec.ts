import { Node } from "../../../model/codeCharta.model"
import { FloorLabelHelper } from "./floorLabelHelper"

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

        it("should not scale since map width is smaller than the canvas edge cap", () => {
            appendMapCanvas(1000)

            expect(FloorLabelHelper.getMapResolutionScaling(400)).toBe(1)
        })

        it("should scale since map width is greater than the canvas edge cap on a wide display", () => {
            appendMapCanvas(2560)

            expect(FloorLabelHelper.getMapResolutionScaling(FloorLabelHelper.MAX_LABEL_CANVAS_EDGE * 2)).toBe(0.5)
        })

        it("should cap the label canvas edge, because a phone cannot afford three map-sized canvases", () => {
            // Arrange — a phone's budgeted drawing buffer is 1532px wide, four times that is 6128
            appendMapCanvas(1532)
            const mapWidth = 20_000

            // Act
            const scaling = FloorLabelHelper.getMapResolutionScaling(mapWidth)

            // Assert
            expect(mapWidth * scaling).toBe(FloorLabelHelper.MAX_LABEL_CANVAS_EDGE)
        })

        it("should keep four times the display width when that stays under the cap", () => {
            // Arrange
            appendMapCanvas(500)

            // Act
            const scaling = FloorLabelHelper.getMapResolutionScaling(20_000)

            // Assert
            expect(20_000 * scaling).toBe(2000)
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
