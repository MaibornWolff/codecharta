import { Node } from "../../../codeCharta.model"
import { Vector2, Vector3 } from "three"

export interface SurfaceInformation {
	node: Node
	surfaceStartIndex: number
	minPos: Vector3
	maxPos: Vector3
}

export class IntermediateVertexData {
	positions: Vector3[]
	normals: Vector3[]
	uvs: Vector2[]
	colors: string[]
	subGeometryIdx: number[]
	deltas: number[]

	indices: number[]
	isVertexHeight: number[]
	floorSurfaceInformation: SurfaceInformation[]

	constructor() {
		this.positions = new Array<Vector3>()
		this.normals = new Array<Vector3>()
		this.uvs = new Array<Vector2>()
		this.colors = new Array<string>()
		this.subGeometryIdx = new Array<number>()
		this.deltas = new Array<number>()

		this.indices = new Array<number>()
		this.isVertexHeight = new Array<number>()
		this.floorSurfaceInformation = new Array<SurfaceInformation>()
	}

	addVertex(pos: Vector3, normal: Vector3, uv: Vector2, color: string, subGeomIndex: number, delta: number,isHeight: number) {
		this.positions.push(pos)
		this.normals.push(normal)
		this.uvs.push(uv)
		this.colors.push(color)
		this.subGeometryIdx.push(subGeomIndex)
		this.deltas.push(delta)
		this.isVertexHeight.push(isHeight)

		return this.positions.length - 1
	}

	addFace(index0: number, index1: number, index2: number) {
		this.indices.push(index0, index1, index2)
	}

	saveFloorSurfaceInformation(node: Node, minPos: Vector3, maxPos: Vector3) {
		const surfaceInformation: SurfaceInformation = {
			node,
			// The starting index of the vertices of the floors top surface must be known.
			// It is used to render the floor surface with a different (label) texture
			surfaceStartIndex: this.indices.length,
			minPos,
			maxPos
		}
		this.floorSurfaceInformation.push(surfaceInformation)
	}
}
