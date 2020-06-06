import * as THREE from "three"
import { IntermediateVertexData } from "./intermediateVertexData"
import { BoxMeasures } from "./geometryGenerator"

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

const normals: THREE.Vector3[] = [
	new THREE.Vector3(-1.0, 0.0, 0.0),
	new THREE.Vector3(1.0, 0.0, 0.0),
	new THREE.Vector3(0.0, -1.0, 0.0),
	new THREE.Vector3(0.0, 1.0, 0.0),
	new THREE.Vector3(0.0, 0.0, -1.0),
	new THREE.Vector3(0.0, 0.0, 1.0)
]

const numSides: number = 6
const verticesPerSide: number = 4

export class BoxGeometryGenerationHelper {
	public static addBoxToVertexData(
		data: IntermediateVertexData,
		measures: BoxMeasures,
		color: string,
		subGeomIdx: number,
		delta: number
	): void {
		const minPos: THREE.Vector3 = new THREE.Vector3(measures.x, measures.y, measures.z)
		const maxPos: THREE.Vector3 = new THREE.Vector3(
			measures.x + measures.width,
			measures.y + measures.height,
			measures.z + measures.depth
		)

		const uvs: THREE.Vector2[] = new Array<THREE.Vector2>()
		const positions: THREE.Vector3[] = new Array<THREE.Vector3>()

		BoxGeometryGenerationHelper.createPositionsUVs(minPos, maxPos, positions, uvs)
		BoxGeometryGenerationHelper.createVerticesAndFaces(
			minPos,
			maxPos,
			color,
			delta,
			subGeomIdx,
			positions,
			uvs,
			data
		)
	}
	private static createPositionsUVs(
		minPos: THREE.Vector3,
		maxPos: THREE.Vector3,
		positions: THREE.Vector3[],
		uvs: THREE.Vector2[]
	): void {
		//Left Vertices
		positions[sides.left * verticesPerSide + vertexLocation.bottomLeft] = new THREE.Vector3(
			minPos.x,
			minPos.y,
			minPos.z
		)
		positions[sides.left * verticesPerSide + vertexLocation.topLeft] = new THREE.Vector3(
			minPos.x,
			maxPos.y,
			minPos.z
		)
		positions[sides.left * verticesPerSide + vertexLocation.topRight] = new THREE.Vector3(
			minPos.x,
			maxPos.y,
			maxPos.z
		)
		positions[sides.left * verticesPerSide + vertexLocation.bottomRight] = new THREE.Vector3(
			minPos.x,
			minPos.y,
			maxPos.z
		)
		uvs[sides.left * verticesPerSide + vertexLocation.bottomLeft] = new THREE.Vector2(1.0, 0.0)
		uvs[sides.left * verticesPerSide + vertexLocation.topLeft] = new THREE.Vector2(1.0, 1.0)
		uvs[sides.left * verticesPerSide + vertexLocation.topRight] = new THREE.Vector2(0.0, 1.0)
		uvs[sides.left * verticesPerSide + vertexLocation.bottomRight] = new THREE.Vector2(0.0, 0.0)

		//Bottom Vertices
		positions[sides.bottom * verticesPerSide + vertexLocation.bottomLeft] = new THREE.Vector3(
			minPos.x,
			minPos.y,
			minPos.z
		)
		positions[sides.bottom * verticesPerSide + vertexLocation.topLeft] = new THREE.Vector3(
			minPos.x,
			minPos.y,
			maxPos.z
		)
		positions[sides.bottom * verticesPerSide + vertexLocation.topRight] = new THREE.Vector3(
			maxPos.x,
			minPos.y,
			maxPos.z
		)
		positions[sides.bottom * verticesPerSide + vertexLocation.bottomRight] = new THREE.Vector3(
			maxPos.x,
			minPos.y,
			minPos.z
		)
		uvs[sides.bottom * verticesPerSide + vertexLocation.bottomLeft] = new THREE.Vector2(0.0, 1.0)
		uvs[sides.bottom * verticesPerSide + vertexLocation.topLeft] = new THREE.Vector2(1.0, 1.0)
		uvs[sides.bottom * verticesPerSide + vertexLocation.topRight] = new THREE.Vector2(1.0, 0.0)
		uvs[sides.bottom * verticesPerSide + vertexLocation.bottomRight] = new THREE.Vector2(0.0, 0.0)

		//Back Vertices
		positions[sides.back * verticesPerSide + vertexLocation.bottomLeft] = new THREE.Vector3(
			maxPos.x,
			minPos.y,
			maxPos.z
		)
		positions[sides.back * verticesPerSide + vertexLocation.topLeft] = new THREE.Vector3(
			minPos.x,
			minPos.y,
			maxPos.z
		)
		positions[sides.back * verticesPerSide + vertexLocation.topRight] = new THREE.Vector3(
			minPos.x,
			maxPos.y,
			maxPos.z
		)
		positions[sides.back * verticesPerSide + vertexLocation.bottomRight] = new THREE.Vector3(
			maxPos.x,
			maxPos.y,
			maxPos.z
		)
		uvs[sides.back * verticesPerSide + vertexLocation.bottomLeft] = new THREE.Vector2(0.0, 0.0)
		uvs[sides.back * verticesPerSide + vertexLocation.topLeft] = new THREE.Vector2(1.0, 0.0)
		uvs[sides.back * verticesPerSide + vertexLocation.topRight] = new THREE.Vector2(1.0, 1.0)
		uvs[sides.back * verticesPerSide + vertexLocation.bottomRight] = new THREE.Vector2(0.0, 1.0)

		BoxGeometryGenerationHelper.createFrontFacingPositionsUVsFromBackFacingData(minPos, maxPos, positions, uvs)
	}

	private static createFrontFacingPositionsUVsFromBackFacingData(
		minPos: THREE.Vector3,
		maxPos: THREE.Vector3,
		positions: THREE.Vector3[],
		uvs: THREE.Vector2[]
	): void {
		for (let i: number = 0; i < verticesPerSide; ++i) {
			positions[sides.right * verticesPerSide + i] = new THREE.Vector3(
				maxPos.x,
				positions[sides.left * verticesPerSide + i].y,
				positions[sides.left * verticesPerSide + i].z
			)

			positions[sides.top * verticesPerSide + i] = new THREE.Vector3(
				positions[sides.bottom * verticesPerSide + i].x,
				maxPos.y,
				positions[sides.bottom * verticesPerSide + i].z
			)

			positions[sides.front * verticesPerSide + i] = new THREE.Vector3(
				positions[sides.back * verticesPerSide + i].x,
				positions[sides.back * verticesPerSide + i].y,
				minPos.z
			)

			const epsilon: number = 0.01

			uvs[sides.right * verticesPerSide + i] = new THREE.Vector2(
				uvs[sides.left * verticesPerSide + i].x > epsilon ? 0.0 : 1.0,
				uvs[sides.left * verticesPerSide + i].y
			)

			uvs[sides.top * verticesPerSide + i] = new THREE.Vector2(
				uvs[sides.bottom * verticesPerSide + i].x,
				uvs[sides.bottom * verticesPerSide + i].y
			)

			uvs[sides.front * verticesPerSide + i] = new THREE.Vector2(
				uvs[sides.back * verticesPerSide + i].x > epsilon ? 0.0 : 1.0,
				uvs[sides.back * verticesPerSide + i].y
			)
		}
	}

	private static createVerticesAndFaces(
		minPos: THREE.Vector3,
		maxPos: THREE.Vector3,
		color: string,
		delta: number,
		subGeomIdx: number,
		positions: THREE.Vector3[],
		uvs: THREE.Vector2[],
		data: IntermediateVertexData
	): void {
		const deltaRelativeToHeight: number = delta / (maxPos.y - minPos.y)

		for (let side: number = 0; side < numSides; ++side) {
			const intermediateIdxBL: number = side * verticesPerSide + vertexLocation.bottomLeft
			const intermediateIdxTL: number = side * verticesPerSide + vertexLocation.topLeft
			const intermediateIdxTR: number = side * verticesPerSide + vertexLocation.topRight
			const intermediateIdxBR: number = side * verticesPerSide + vertexLocation.bottomRight
			const indexBottomLeft: number = data.addVertex(
				positions[intermediateIdxBL],
				normals[side],
				uvs[intermediateIdxBL],
				color,
				subGeomIdx,
				deltaRelativeToHeight
			)
			const indexTopLeft: number = data.addVertex(
				positions[intermediateIdxTL],
				normals[side],
				uvs[intermediateIdxTL],
				color,
				subGeomIdx,
				deltaRelativeToHeight
			)
			const indexTopRight: number = data.addVertex(
				positions[intermediateIdxTR],
				normals[side],
				uvs[intermediateIdxTR],
				color,
				subGeomIdx,
				deltaRelativeToHeight
			)
			const indexBottomRight: number = data.addVertex(
				positions[intermediateIdxBR],
				normals[side],
				uvs[intermediateIdxBR],
				color,
				subGeomIdx,
				deltaRelativeToHeight
			)
			const dimension: number = Math.floor(side / 2)
			const positiveFacing: boolean = normals[side].getComponent(dimension) > 0.0
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
