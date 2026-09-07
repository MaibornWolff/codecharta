import { MeshBasicMaterial, Vector3 } from "three"
import { Node } from "../../../model/codeCharta.model"
import { FloorLabelDrawer } from "./floorLabelDrawer"

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
                    ? ({ width: widthOfTextTooLongForItsFloor } as TextMetrics)
                    : ({ width: 40 } as TextMetrics)
            }),
            fillText: jest.fn(),
            strokeText: jest.fn(),
            fillStyle: undefined,
            strokeStyle: undefined,
            lineWidth: undefined,
            lineJoin: undefined,
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
    // Labels are rasterized at a 64px font, so this is a name about thirty glyph heights wide
    const widthOfTextTooLongForItsFloor = 2000

    describe("draw", () => {
        it("should draw one plane per labelled folder, shortening a name that does not fit its floor", () => {
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
            expect(canvasContextMock.fillText).toHaveBeenNthCalledWith(
                5,
                expect.stringMatching(/^text.+…$/),
                expect.any(Number),
                expect.any(Number)
            )

            expect(floorLabelPlanes.length).toBe(5)
        })

        it("should draw an outline behind each label so it stays readable at distance", () => {
            // Arrange
            initMapCanvas()

            const rootNode = createFakeNode("root", 500, 500, false, 0)
            const nodes = [rootNode, createFakeNode("simpleLabelNode1", 400, 400, false, 1)]

            const canvasContextMock = createCanvasMock()

            // Act
            const floorLabelDrawer = new FloorLabelDrawer(nodes, rootNode, mapSize, scaling, false)
            floorLabelDrawer.draw()

            // Assert
            expect(canvasContextMock.strokeText).toHaveBeenCalledTimes(2)
            expect(canvasContextMock.strokeText.mock.calls).toEqual(canvasContextMock.fillText.mock.calls)
            expect(canvasContextMock.strokeText.mock.invocationCallOrder[0]).toBeLessThan(
                canvasContextMock.fillText.mock.invocationCallOrder[0]
            )
        })

        it("should apply the given anisotropy to the label textures", () => {
            // Arrange
            initMapCanvas()

            const rootNode = createFakeNode("root", 500, 500, false, 0)
            const nodes = [rootNode, createFakeNode("simpleLabelNode1", 400, 400, false, 1)]

            createCanvasMock()
            const maxAnisotropy = 8

            // Act
            const floorLabelDrawer = new FloorLabelDrawer(nodes, rootNode, mapSize, scaling, false, maxAnisotropy)
            const floorLabelPlanes = floorLabelDrawer.draw()

            // Assert
            for (const plane of floorLabelPlanes) {
                expect((plane.material as MeshBasicMaterial).map.anisotropy).toBe(maxAnisotropy)
            }
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

            expect(floorLabelPlanes.length).toBe(5)
        })

        it("should not label folders below the third level", () => {
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
            expect(floorLabelPlanes.length).toBe(4)
        })

        it("should not label leaves", () => {
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
        it("should lift every label to its level's floor height when the map is rescaled", () => {
            // Arrange
            initMapCanvas()
            const rootNode = createFakeNode("root", 500, 500, false, 0)
            const nodes = [
                rootNode,
                createFakeNode("simpleLabelNode1", 400, 400, false, 1),
                createFakeNode("unlabeledNode", 100, 100, true, 1)
            ]
            const floorLabelDrawer = new FloorLabelDrawer(nodes, rootNode, mapSize, scaling, false)
            const [rootLabel, childLabel] = floorLabelDrawer.draw()
            const liftToPreventZFighting = 2

            // Act
            floorLabelDrawer.translatePlaneCanvases(new Vector3(1, 1.5, 1))

            // Assert
            expect(rootLabel.position.y).toBeCloseTo(2.01 * 1.5 + liftToPreventZFighting, 5)
            expect(childLabel.position.y).toBeCloseTo(2.01 * 1.5 * 2 + liftToPreventZFighting, 5)
        })

        it("should place a label at its level's floor height before any rescaling", () => {
            // Arrange
            initMapCanvas()
            const rootNode = createFakeNode("root", 500, 500, false, 0)
            const floorLabelDrawer = new FloorLabelDrawer([rootNode], rootNode, mapSize, scaling, false)

            // Act
            const [rootLabel] = floorLabelDrawer.draw()

            // Assert
            expect(rootLabel.position.y).toBeCloseTo(2.01 + 2, 5)
        })
    })
})
