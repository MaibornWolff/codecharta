import { Vector2, Vector3 } from "three"

export class IntermediateVertexData {
	positions: Vector3[]
	normals: Vector3[]
	uvs: Vector2[]
	colors: string[]
	subGeometryIdx: number[]
	deltas: number[]

	indices: number[]

	constructor() {
		this.positions = new Array<Vector3>()
		this.normals = new Array<Vector3>()
		this.uvs = new Array<Vector2>()
		this.colors = new Array<string>()
		this.subGeometryIdx = new Array<number>()
		this.deltas = new Array<number>()

		this.indices = new Array<number>()
	}

	addVertex(pos: Vector3, normal: Vector3, uv: Vector2, color: string, subGeomIdx: number, delta: number) {
		this.positions.push(pos)
		this.normals.push(normal)
		this.uvs.push(uv)
		this.colors.push(color)
		this.subGeometryIdx.push(subGeomIdx)
		this.deltas.push(delta)

		return this.positions.length - 1
	}

	addFace(i0: number, i1: number, i2: number) {
		this.indices.push(i0, i1, i2)
	}
}
