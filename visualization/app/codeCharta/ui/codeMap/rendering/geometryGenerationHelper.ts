import { Node } from "../../../codeCharta.model"
import { CodeMapBuilding } from "./codeMapBuilding"
import { Box3, Vector3, Vector2 } from "three"
import { CodeMapGeometricDescription } from "./codeMapGeometricDescription"
import { ColorConverter } from "../../../util/color/colorConverter"

export interface BoxMeasures {
	x: number
	y: number
	z: number
	width: number
	height: number
	depth: number
}

export interface SurfaceInformation {
	node: Node
	surfaceStartIndex: number
	minPos: Vector2
	maxPos: Vector2
}

export interface IntermediateVertexData {
	positions: Float32Array
	normals: Float32Array
	uvs: Float32Array
	colors: Float32Array

	indices: Uint32Array
	ids: Float32Array

	deltas: Float32Array
	isHeight: Float32Array

	floorSurfaceInformation: SurfaceInformation[]
}

enum sides {
	left = 0,
	right = 1,
	bottom = 2,
	top = 3,
	back = 4,
	front = 5
}

const normals = [
	new Vector3(-1, 0, 0),
	new Vector3(1, 0, 0),
	new Vector3(0, -1, 0),
	new Vector3(0, 1, 0),
	new Vector3(0, 0, -1),
	new Vector3(0, 0, 1)
]

const numberSides = 6
const verticesPerSide = 4
const threeDimensions = 3
const twoDimensions = 2

// Helper functions

export function addBoxToVertexData(
	data: IntermediateVertexData,
	node: Node,
	measures: BoxMeasures,
	color: string,
	subGeomIndex: number,
	desc: CodeMapGeometricDescription,
	delta: number,
	addingFloor: boolean
) {
	desc.add(
		new CodeMapBuilding(
			subGeomIndex,
			new Box3(
				new Vector3(measures.x, measures.y, measures.z),
				new Vector3(measures.x + measures.width, measures.y + measures.height, measures.z + measures.depth)
			),
			node,
			color
		)
	)

	setPositions(data.positions, measures, subGeomIndex)
	setUVs(data.uvs, subGeomIndex)
	setVerticesAndFaces(node, measures, color, delta, subGeomIndex, data, addingFloor)
}

function setPositions(positions: Float32Array, measures: BoxMeasures, index: number) {
	const { x: minPosX, y: minPosY, z: minPosZ, width, height, depth } = measures
	const maxPosX = minPosX + width
	const maxPosY = minPosY + height
	const maxPosZ = minPosZ + depth

	let positionIndex = index * verticesPerSide * numberSides * threeDimensions

	// left // 0
	positions[positionIndex++] = minPosX
	positions[positionIndex++] = minPosY
	positions[positionIndex++] = minPosZ

	positions[positionIndex++] = minPosX
	positions[positionIndex++] = maxPosY
	positions[positionIndex++] = minPosZ

	positions[positionIndex++] = minPosX
	positions[positionIndex++] = maxPosY
	positions[positionIndex++] = maxPosZ

	positions[positionIndex++] = minPosX
	positions[positionIndex++] = minPosY
	positions[positionIndex++] = maxPosZ

	// right // 1
	positions[positionIndex++] = maxPosX
	positions[positionIndex++] = minPosY
	positions[positionIndex++] = minPosZ

	positions[positionIndex++] = maxPosX
	positions[positionIndex++] = maxPosY
	positions[positionIndex++] = minPosZ

	positions[positionIndex++] = maxPosX
	positions[positionIndex++] = maxPosY
	positions[positionIndex++] = maxPosZ

	positions[positionIndex++] = maxPosX
	positions[positionIndex++] = minPosY
	positions[positionIndex++] = maxPosZ

	// bottom // 2
	positions[positionIndex++] = minPosX
	positions[positionIndex++] = minPosY
	positions[positionIndex++] = minPosZ

	positions[positionIndex++] = minPosX
	positions[positionIndex++] = minPosY
	positions[positionIndex++] = maxPosZ

	positions[positionIndex++] = maxPosX
	positions[positionIndex++] = minPosY
	positions[positionIndex++] = maxPosZ

	positions[positionIndex++] = maxPosX
	positions[positionIndex++] = minPosY
	positions[positionIndex++] = minPosZ

	// top // 3
	positions[positionIndex++] = minPosX
	positions[positionIndex++] = maxPosY
	positions[positionIndex++] = minPosZ

	positions[positionIndex++] = minPosX
	positions[positionIndex++] = maxPosY
	positions[positionIndex++] = maxPosZ

	positions[positionIndex++] = maxPosX
	positions[positionIndex++] = maxPosY
	positions[positionIndex++] = maxPosZ

	positions[positionIndex++] = maxPosX
	positions[positionIndex++] = maxPosY
	positions[positionIndex++] = minPosZ

	// back // 4
	positions[positionIndex++] = maxPosX
	positions[positionIndex++] = minPosY
	positions[positionIndex++] = maxPosZ

	positions[positionIndex++] = minPosX
	positions[positionIndex++] = minPosY
	positions[positionIndex++] = maxPosZ

	positions[positionIndex++] = minPosX
	positions[positionIndex++] = maxPosY
	positions[positionIndex++] = maxPosZ

	positions[positionIndex++] = maxPosX
	positions[positionIndex++] = maxPosY
	positions[positionIndex++] = maxPosZ

	// front // 5
	positions[positionIndex++] = maxPosX
	positions[positionIndex++] = minPosY
	positions[positionIndex++] = minPosZ

	positions[positionIndex++] = minPosX
	positions[positionIndex++] = minPosY
	positions[positionIndex++] = minPosZ

	positions[positionIndex++] = minPosX
	positions[positionIndex++] = maxPosY
	positions[positionIndex++] = minPosZ

	positions[positionIndex++] = maxPosX
	positions[positionIndex++] = maxPosY
	positions[positionIndex++] = minPosZ
}

const uvArray = [
	// Left x, y
	1,
	0,
	1,
	1,
	0,
	1,
	0,
	0,

	// Right x, y
	0,
	0,
	0,
	1,
	1,
	1,
	1,
	0,

	// Bottom x, y
	0,
	1,
	1,
	1,
	1,
	0,
	0,
	0,

	// Top x, y
	0,
	1,
	1,
	1,
	1,
	0,
	0,
	0,

	// Back x, y
	0,
	0,
	1,
	0,
	1,
	1,
	0,
	1,

	// Front x, y
	1,
	0,
	0,
	0,
	0,
	1,
	1,
	1
]

function setUVs(uvs: Float32Array, index: number) {
	const uvIndex = index * verticesPerSide * numberSides * twoDimensions

	uvs.set(uvArray, uvIndex)
}

function isTopSide(side: number, node: Node) {
	if (!node.isLeaf || side === sides.bottom) {
		return [0, 0, 0, 0]
	}
	if (side === sides.top) {
		return [1, 1, 1, 1]
	}
	if (side <= sides.right) {
		return [0, 1, 1, 0]
	}
	return [0, 0, 1, 1]
}

function setVerticesAndFaces(
	node: Node,
	measures: BoxMeasures,
	color: string,
	delta: number,
	subGeomIndex: number,
	data: IntermediateVertexData,
	addingFloor: boolean
) {
	const { x: minPosX, y: minPosY, z: minPosZ, width, height, depth } = measures
	const maxPosX = minPosX + width
	const maxPosY = minPosY + height
	const maxPosZ = minPosZ + depth

	const deltaRelativeToHeight = delta / (maxPosY - minPosY)

	let index = subGeomIndex * numberSides * verticesPerSide
	let vector3Index = index * threeDimensions
	let surfaceStartIndex = subGeomIndex * numberSides * numberSides

	const colorVector = ColorConverter.getVector3(color)

	for (let side = 0; side < numberSides; side++) {
		const topSides = isTopSide(side, node)
		const normal = normals[side]
		const indexBottomLeft = index
		const indexTopLeft = index + 1
		const indexTopRight = index + 2
		const indexBottomRight = index + 3

		data.isHeight.set(topSides, index)

		for (let vertice = 0; vertice < verticesPerSide; vertice++) {
			data.colors[vector3Index] = colorVector.x
			data.normals[vector3Index] = normal.x

			vector3Index += 1

			data.colors[vector3Index] = colorVector.y
			data.normals[vector3Index] = normal.y

			vector3Index += 1

			data.colors[vector3Index] = colorVector.z
			data.normals[vector3Index] = normal.z

			vector3Index += 1

			data.ids[index] = subGeomIndex
			data.deltas[index] = deltaRelativeToHeight

			index += 1
		}

		const dimension = Math.floor(side / 2)
		const positiveFacing = normal.getComponent(dimension) > 0

		if (positiveFacing) {
			// Collect floors from a depth of 0 until a depth of 3 to be stamped with the folder name as a label
			// TODO provide conditions centrally for checking if a floor has to be labeled.
			if (addingFloor && side === sides.top && node.mapNodeDepth >= 0 && node.mapNodeDepth < 3) {
				const surfaceInformation: SurfaceInformation = {
					node,
					// The starting index of the vertices of the floors top surface must be known.
					// It is used to render the floor surface with a different (label) texture
					surfaceStartIndex,
					minPos: new Vector2(minPosX, minPosZ),
					maxPos: new Vector2(maxPosX, maxPosZ)
				}
				data.floorSurfaceInformation.push(surfaceInformation)
			}

			data.indices.set(
				[indexBottomLeft, indexTopLeft, indexTopRight, indexBottomLeft, indexTopRight, indexBottomRight],
				surfaceStartIndex
			)
		} else {
			data.indices.set(
				[indexBottomLeft, indexTopRight, indexTopLeft, indexBottomLeft, indexBottomRight, indexTopRight],
				surfaceStartIndex
			)
		}

		surfaceStartIndex += numberSides
	}
}
