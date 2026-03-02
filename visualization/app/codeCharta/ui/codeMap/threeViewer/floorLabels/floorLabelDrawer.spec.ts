import { Node } from "../../../../codeCharta.model"
import { FloorLabelDrawer } from "./floorLabelDrawer"
import { Vector3 } from "three"

describe("FloorLabelDrawer", () => {
    let createElementOrigin
    afterEach(() => {
        document.createElement = createElementOrigin
    })

    function createFakeNode(name: string, width: number, length: number, isLeaf: boolean, mapNodeDepth?: number): Node {
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
            length,
            link: "",
            mapNodeDepth,
            markingColor: undefined,
            name,
            outgoingEdgePoint: undefined,
            path: "",
            visible: false,
            width,
            x0: 0,
            y0: 0,
            z0: 0
        }
    }

    function initMapCanvas() {
        const mapCanvas = document.createElement("canvas")
        mapCanvas.id = "codeMapScene"
        document.body.appendChild(mapCanvas)
    }

    function createCanvasMock() {
        const canvasContextMock = {
            font: "",
            measureText: jest.fn((labelText: string) => {
                return labelText === "text_to_be_shortened_to_fit_onto_the_floor"
                    ? ({ width: 500 } as TextMetrics)
                    : ({ width: 40 } as TextMetrics)
            }),
            fillText: jest.fn(),
            fillStyle: undefined,
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            arcTo: jest.fn(),
            closePath: jest.fn(),
            fill: jest.fn()
        }

        createElementOrigin = document.createElement

        document.createElement = jest.fn().mockReturnValue({
            getContext: () => {
                return canvasContextMock
            }
        })

        return canvasContextMock
    }

    const mapSize = 500
    const scaling: Vector3 = { x: 1, y: 1, z: 1 } as Vector3

    describe("draw", () => {
        it("should draw simple and shortened labels on three levels", () => {
            initMapCanvas()

            const rootNode = createFakeNode("root", 500, 500, false, 0)
            const nodes = [
                rootNode,
                createFakeNode("simpleLabelNode1", 400, 400, false, 1),
                createFakeNode("simpleLabelNode2", 200, 200, false, 2),
                createFakeNode("simpleLabelNode3", 150, 150, false, 2),
                createFakeNode("text_to_be_shortened_to_fit_onto_the_floor", 50, 50, false, 2)
            ]

            const canvasContextMock = createCanvasMock()

            const floorLabelDrawer = new FloorLabelDrawer(nodes, rootNode, mapSize, scaling, false)
            const floorLabelPlanes = floorLabelDrawer.draw()

            expect(canvasContextMock.fillText).toHaveBeenCalledTimes(5)
            expect(canvasContextMock.fillText).toHaveBeenNthCalledWith(1, "root", expect.any(Number), expect.any(Number))
            expect(canvasContextMock.fillText).toHaveBeenNthCalledWith(2, "simpleLabelNode1", expect.any(Number), expect.any(Number))
            expect(canvasContextMock.fillText).toHaveBeenNthCalledWith(3, "simpleLabelNode2", expect.any(Number), expect.any(Number))
            expect(canvasContextMock.fillText).toHaveBeenNthCalledWith(4, "simpleLabelNode3", expect.any(Number), expect.any(Number))
            expect(canvasContextMock.fillText).toHaveBeenNthCalledWith(5, "text…", expect.any(Number), expect.any(Number))

            expect(floorLabelPlanes.length).toBe(3)
        })

        it("should scale folderGeometryHeight when experimentalFeatures are enabled", () => {
            initMapCanvas()

            const rootNode = createFakeNode("root", 20_000, 20_000, false, 0)
            const nodes = [
                rootNode,
                createFakeNode("simpleLabelNode1", 4000, 4000, false, 1),
                createFakeNode("simpleLabelNode2", 2000, 2000, false, 2),
                createFakeNode("simpleLabelNode3", 1500, 1500, false, 2),
                createFakeNode("text_to_be_shortened_to_fit_onto_the_floor", 50, 50, false, 2)
            ]

            const floorLabelDrawer = new FloorLabelDrawer(nodes, rootNode, mapSize, scaling, true)
            const floorLabelPlanes = floorLabelDrawer.draw()

            expect(floorLabelDrawer.folderGeometryHeight).toBe(68)

            expect(floorLabelPlanes.length).toBe(3)
        })

        it("should not draw on more than three levels'", () => {
            initMapCanvas()

            const rootNode = createFakeNode("root", 500, 500, false, 0)
            const nodes = [
                rootNode,
                createFakeNode("simpleLabelNode1", 400, 400, false, 1),
                createFakeNode("simpleLabelNode2", 200, 200, false, 2),
                createFakeNode("simpleLabelNode3", 150, 150, false, 2),
                createFakeNode("simpleLabelNode4", 50, 50, false, 3),
                createFakeNode("simpleLabelNode5", 25, 25, false, 4)
            ]

            const canvasContextMock = createCanvasMock()

            const floorLabelDrawer = new FloorLabelDrawer(nodes, rootNode, mapSize, scaling, false)
            const floorLabelPlanes = floorLabelDrawer.draw()

            expect(canvasContextMock.fillText).toHaveBeenCalledTimes(4)
            expect(floorLabelPlanes.length).toBe(3)
        })

        it("should not draw on more levels than needed'", () => {
            initMapCanvas()

            const rootNode = createFakeNode("root", 500, 500, false, 0)
            const nodes = [
                rootNode,
                createFakeNode("simpleLabelNode1", 400, 400, false, 1),
                createFakeNode("unlabeledNode", 100, 100, true, 1)
            ]

            const canvasContextMock = createCanvasMock()

            const floorLabelDrawer = new FloorLabelDrawer(nodes, rootNode, mapSize, scaling, false)
            const floorLabelPlanes = floorLabelDrawer.draw()

            expect(canvasContextMock.fillText).toHaveBeenCalledTimes(2)
            expect(floorLabelPlanes.length).toBe(2)
        })
    })

    describe("translatePlaneCanvases", () => {
        it("should be a no-op since folders no longer scale with height", () => {
            // Arrange
            initMapCanvas()

            const rootNode = createFakeNode("root", 500, 500, false, 0)
            const nodes = [
                rootNode,
                createFakeNode("simpleLabelNode1", 400, 400, false, 1),
                createFakeNode("unlabeledNode", 100, 100, true, 1)
            ]

            const floorLabelDrawer = new FloorLabelDrawer(nodes, rootNode, mapSize, scaling, false)
            const floorLabelPlanes = floorLabelDrawer.draw()
            const positionBefore = floorLabelPlanes[0].geometry.attributes.position.array[2]

            // Act
            floorLabelDrawer.translatePlaneCanvases(new Vector3(1, 2, 1))

            // Assert
            const positionAfter = floorLabelDrawer["floorLabelPlanes"][0].geometry.attributes.position.array[2]
            expect(positionAfter).toBeCloseTo(positionBefore, 5)
        })
    })
})
