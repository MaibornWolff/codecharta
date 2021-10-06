import { Node } from "../../../../codeCharta.model"
import { FloorLabelDrawer } from "./floorLabelDrawer"
import { Vector3 } from "three"

describe("FloorLabelDrawer", () => {
	describe("draw", () => {
		function createNode(name: string, width: number, length: number, isLeaf: boolean, mapNodeDepth?: number): Node {
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

		document.body.appendChild(document.createElement("canvas"))

		function createCanvasMock() {
			const canvasContextMock = {
				font: "",
				measureText: jest.fn((labelText: string) => {
					if (labelText === "text_to_be_shortened_to_fit_onto_the_floor") {
						return { width: 500 } as TextMetrics
					}
					return { width: 40 } as TextMetrics
				}),
				fillText: jest.fn(),
				fillStyle: undefined,
				beginPath: jest.fn(),
				moveTo: jest.fn(),
				arcTo: jest.fn(),
				closePath: jest.fn(),
				fill: jest.fn()
			}

			const canvasMock = jest.fn().mockReturnValue({
				getContext: () => {
					return canvasContextMock
				}
			})

			document.createElement = canvasMock

			return canvasContextMock
		}

		const mapSize = 500
		const scaling: Vector3 = { x: 1, y: 1, z: 1 } as Vector3

		it("should draw simple and shortened labels on three levels", () => {
			document.body.appendChild(document.createElement("canvas"))

			const rootNode = createNode("root", 500, 500, false, 0)
			const nodes = [
				rootNode,
				createNode("simpleLabelNode1", 400, 400, false, 1),
				createNode("simpleLabelNode2", 200, 200, false, 2),
				createNode("simpleLabelNode3", 150, 150, false, 2),
				createNode("text_to_be_shortened_to_fit_onto_the_floor", 50, 50, false, 2)
			]

			const canvasContextMock = createCanvasMock()

			const floorLabelDrawer = new FloorLabelDrawer(nodes, rootNode, mapSize, scaling)
			const floorLabelPlanes = floorLabelDrawer.draw()

			expect(canvasContextMock.fillText).toHaveBeenCalledTimes(5)
			expect(canvasContextMock.fillText).toHaveBeenNthCalledWith(1, "root", expect.any(Number), expect.any(Number))
			expect(canvasContextMock.fillText).toHaveBeenNthCalledWith(2, "simpleLabelNode1", expect.any(Number), expect.any(Number))
			expect(canvasContextMock.fillText).toHaveBeenNthCalledWith(3, "simpleLabelNode2", expect.any(Number), expect.any(Number))
			expect(canvasContextMock.fillText).toHaveBeenNthCalledWith(4, "simpleLabelNode3", expect.any(Number), expect.any(Number))
			expect(canvasContextMock.fillText).toHaveBeenNthCalledWith(5, "text…", expect.any(Number), expect.any(Number))

			expect(floorLabelPlanes.length).toBe(3)
		})

		it("should not draw on more than three levels'", () => {
			const rootNode = createNode("root", 500, 500, false, 0)
			const nodes = [
				rootNode,
				createNode("simpleLabelNode1", 400, 400, false, 1),
				createNode("simpleLabelNode2", 200, 200, false, 2),
				createNode("simpleLabelNode3", 150, 150, false, 2),
				createNode("simpleLabelNode4", 50, 50, false, 3),
				createNode("simpleLabelNode5", 25, 25, false, 4)
			]

			const canvasContextMock = createCanvasMock()

			const floorLabelDrawer = new FloorLabelDrawer(nodes, rootNode, mapSize, scaling)
			const floorLabelPlanes = floorLabelDrawer.draw()

			expect(canvasContextMock.fillText).toHaveBeenCalledTimes(4)
			expect(floorLabelPlanes.length).toBe(3)
		})

		it("should not draw on more levels than needed'", () => {
			const rootNode = createNode("root", 500, 500, false, 0)
			const nodes = [rootNode, createNode("simpleLabelNode1", 400, 400, false, 1), createNode("unlabeledNode", 100, 100, true, 1)]

			const canvasContextMock = createCanvasMock()

			const floorLabelDrawer = new FloorLabelDrawer(nodes, rootNode, mapSize, scaling)
			const floorLabelPlanes = floorLabelDrawer.draw()

			expect(canvasContextMock.fillText).toHaveBeenCalledTimes(2)
			expect(floorLabelPlanes.length).toBe(2)
		})
	})
})
