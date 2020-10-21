import { IntermediateVertexData } from "./intermediateVertexData"
import { BoxMeasures } from "./geometryGenerator"
import { Vector2, Vector3 } from "three"

enum sides {
	left = 0,
	right = 1,
	bottom = 2,
	top = 3,
	back = 4,
	front = 5
}

enum vertexLocation {
	bottomLeft = 0,
	topLeft = 1,
	topRight = 2,
	bottomRight = 3
}

const normals: Vector3[] = [
	new Vector3(-1, 0, 0),
	new Vector3(1, 0, 0),
	new Vector3(0, -1, 0),
	new Vector3(0, 1, 0),
	new Vector3(0, 0, -1),
	new Vector3(0, 0, 1)
]

const numberSides = 6
const verticesPerSide = 4

export class BoxGeometryGenerationHelper {
	static addBoxToVertexData(data: IntermediateVertexData, measures: BoxMeasures, color: string, subGeomIndex: number, delta: number) {
		const minPos: Vector3 = new Vector3(measures.x, measures.y, measures.z)
		const maxPos: Vector3 = new Vector3(measures.x + measures.width, measures.y + measures.height, measures.z + measures.depth)

		const uvs: Vector2[] = new Array<Vector2>()
		const positions: Vector3[] = new Array<Vector3>()

		BoxGeometryGenerationHelper.createPositionsUVs(minPos, maxPos, positions, uvs)
		BoxGeometryGenerationHelper.createVerticesAndFaces(minPos, maxPos, color, delta, subGeomIndex, positions, uvs, data)
	}
	private static createPositionsUVs(minPos: Vector3, maxPos: Vector3, positions: Vector3[], uvs: Vector2[]) {
		//Left Vertices
		const left = sides.left * verticesPerSide
		positions[left] = new Vector3(minPos.x, minPos.y, minPos.z)
		positions[left + vertexLocation.topLeft] = new Vector3(minPos.x, maxPos.y, minPos.z)
		positions[left + vertexLocation.topRight] = new Vector3(minPos.x, maxPos.y, maxPos.z)
		positions[left + vertexLocation.bottomRight] = new Vector3(minPos.x, minPos.y, maxPos.z)
		uvs[left] = new Vector2(1, 0)
		uvs[left + vertexLocation.topLeft] = new Vector2(1, 1)
		uvs[left + vertexLocation.topRight] = new Vector2(0, 1)
		uvs[left + vertexLocation.bottomRight] = new Vector2(0, 0)

		//Bottom Vertices
		const bottom = sides.bottom * verticesPerSide
		positions[bottom] = positions[left]
		positions[bottom + vertexLocation.topLeft] = positions[left + vertexLocation.bottomRight]
		positions[bottom + vertexLocation.topRight] = new Vector3(maxPos.x, minPos.y, maxPos.z)
		positions[bottom + vertexLocation.bottomRight] = new Vector3(maxPos.x, minPos.y, minPos.z)
		uvs[bottom] = new Vector2(0, 1)
		uvs[bottom + vertexLocation.topLeft] = new Vector2(1, 1)
		uvs[bottom + vertexLocation.topRight] = new Vector2(1, 0)
		uvs[bottom + vertexLocation.bottomRight] = new Vector2(0, 0)

		//Back Vertices
		const back = sides.back * verticesPerSide
		positions[back] = positions[bottom + vertexLocation.topRight]
		positions[back + vertexLocation.topLeft] = positions[left + vertexLocation.bottomRight]
		positions[back + vertexLocation.topRight] = positions[left + vertexLocation.topRight]
		positions[back + vertexLocation.bottomRight] = new Vector3(maxPos.x, maxPos.y, maxPos.z)
		uvs[back] = uvs[bottom + vertexLocation.bottomRight]
		uvs[back + vertexLocation.topLeft] = uvs[bottom + vertexLocation.topRight]
		uvs[back + vertexLocation.topRight] = uvs[bottom + vertexLocation.topLeft]
		uvs[back + vertexLocation.bottomRight] = uvs[bottom]

		BoxGeometryGenerationHelper.createFrontFacingPositionsUVsFromBackFacingData(minPos, maxPos, positions, uvs)
	}

	private static createFrontFacingPositionsUVsFromBackFacingData(minPos: Vector3, maxPos: Vector3, positions: Vector3[], uvs: Vector2[]) {
		for (let index = 0; index < verticesPerSide; ++index) {
			positions[sides.right * verticesPerSide + index] = new Vector3(
				maxPos.x,
				positions[sides.left * verticesPerSide + index].y,
				positions[sides.left * verticesPerSide + index].z
			)

			positions[sides.top * verticesPerSide + index] = new Vector3(
				positions[sides.bottom * verticesPerSide + index].x,
				maxPos.y,
				positions[sides.bottom * verticesPerSide + index].z
			)

			positions[sides.front * verticesPerSide + index] = new Vector3(
				positions[sides.back * verticesPerSide + index].x,
				positions[sides.back * verticesPerSide + index].y,
				minPos.z
			)

			const epsilon = 0.01

			uvs[sides.right * verticesPerSide + index] = new Vector2(
				uvs[sides.left * verticesPerSide + index].x > epsilon ? 0 : 1,
				uvs[sides.left * verticesPerSide + index].y
			)

			uvs[sides.top * verticesPerSide + index] = new Vector2(
				uvs[sides.bottom * verticesPerSide + index].x,
				uvs[sides.bottom * verticesPerSide + index].y
			)

			uvs[sides.front * verticesPerSide + index] = new Vector2(
				uvs[sides.back * verticesPerSide + index].x > epsilon ? 0 : 1,
				uvs[sides.back * verticesPerSide + index].y
			)
		}
	}

	private static createVerticesAndFaces(
		minPos: Vector3,
		maxPos: Vector3,
		color: string,
		delta: number,
		subGeomIndex: number,
		positions: Vector3[],
		uvs: Vector2[],
		data: IntermediateVertexData
	) {
		const deltaRelativeToHeight = delta / (maxPos.y - minPos.y)

		for (let side = 0; side < numberSides; ++side) {
			const intermediateIndexBL = side * verticesPerSide + vertexLocation.bottomLeft
			const intermediateIndexTL = side * verticesPerSide + vertexLocation.topLeft
			const intermediateIndexTR = side * verticesPerSide + vertexLocation.topRight
			const intermediateIndexBR = side * verticesPerSide + vertexLocation.bottomRight
			const indexBottomLeft = data.addVertex(
				positions[intermediateIndexBL],
				normals[side],
				uvs[intermediateIndexBL],
				color,
				subGeomIndex,
				deltaRelativeToHeight
			)
			const indexTopLeft = data.addVertex(
				positions[intermediateIndexTL],
				normals[side],
				uvs[intermediateIndexTL],
				color,
				subGeomIndex,
				deltaRelativeToHeight
			)
			const indexTopRight = data.addVertex(
				positions[intermediateIndexTR],
				normals[side],
				uvs[intermediateIndexTR],
				color,
				subGeomIndex,
				deltaRelativeToHeight
			)
			const indexBottomRight = data.addVertex(
				positions[intermediateIndexBR],
				normals[side],
				uvs[intermediateIndexBR],
				color,
				subGeomIndex,
				deltaRelativeToHeight
			)
			const dimension = Math.floor(side / 2)
			const positiveFacing = normals[side].getComponent(dimension) > 0
			if (!positiveFacing) {
				data.addFace(indexBottomLeft, indexTopRight, indexTopLeft)
				data.addFace(indexBottomLeft, indexBottomRight, indexTopRight)
			} else {
				data.addFace(indexBottomLeft, indexTopLeft, indexTopRight)
				data.addFace(indexBottomLeft, indexTopRight, indexBottomRight)
			}
		}
	}
}
