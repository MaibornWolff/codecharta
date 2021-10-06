import { Node } from "../../../../codeCharta.model"
import { FloorLabelDrawer } from "./floorLabelDrawer"
import { Vector3 } from "three"

describe("FloorLabelDrawer", () => {
	describe("draw", () => {
		function createNode(name: string, isLeaf: boolean, mapNodeDepth?: number): Node {
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
				length: 100,
				link: "",
				mapNodeDepth,
				markingColor: undefined,
				name,
				outgoingEdgePoint: undefined,
				path: "",
				visible: false,
				width: 200,
				x0: 0,
				y0: 0,
				z0: 0
			}
		}

		it("should simply draw labels on three levels", () => {
			document.body.appendChild(document.createElement("canvas"))

			const rootNode = createNode("root", false, 0)
			const nodes = [
				rootNode,
				createNode("simpleLabelNode1", false, 1),
				createNode("simpleLabelNode2", false, 2),
				createNode("simpleLabelNode3", false, 2),
				createNode("text_to_be_shortened_to_fit_onto_the_floor", false, 2)
			]
			const mapSize = 500
			const scaling: Vector3 = { x: 1, y: 1, z: 1 } as Vector3

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

			document.createElement = jest.fn().mockReturnValue({
				getContext: () => {
					return canvasContextMock
				}
			})

			const floorLabelDrawer = new FloorLabelDrawer(nodes, rootNode, mapSize, scaling)
			const floorLabelPlanes = floorLabelDrawer.draw()

			expect(canvasContextMock.fillText).toHaveBeenCalledTimes(5)
			expect(canvasContextMock.fillText).toHaveBeenNthCalledWith(1, "root", expect.any(Number), expect.any(Number))
			expect(canvasContextMock.fillText).toHaveBeenNthCalledWith(2, "simpleLabelNode1", expect.any(Number), expect.any(Number))
			expect(canvasContextMock.fillText).toHaveBeenNthCalledWith(3, "simpleLabelNode2", expect.any(Number), expect.any(Number))
			expect(canvasContextMock.fillText).toHaveBeenNthCalledWith(4, "simpleLabelNode3", expect.any(Number), expect.any(Number))
			expect(canvasContextMock.fillText).toHaveBeenNthCalledWith(5, "text_to_...", expect.any(Number), expect.any(Number))

			expect(floorLabelPlanes.length).toBe(3)

			//expect shortened texts
			//expect scaled fonts
		})
	})
})
