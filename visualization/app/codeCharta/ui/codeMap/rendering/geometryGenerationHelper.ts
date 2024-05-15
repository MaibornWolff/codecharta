import { Node } from "../../../codeCharta.model"
import { CodeMapBuilding } from "./codeMapBuilding"
import { Box3, Vector3 } from "three"
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
    minPos: { z: number; x: number }
    maxPos: { z: number; x: number }
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
}

enum sides {
    left = 0,
    right = 1,
    bottom = 2,
    top = 3,
    back = 4,
    front = 5
}

// Vector 3: x, y, z
const normals = [
    [-1, 0, 0],
    [1, 0, 0],
    [0, -1, 0],
    [0, 1, 0],
    [0, 0, -1],
    [0, 0, 1]
]

const uvArray = [
    // Left x, y
    1, 0, 1, 1, 0, 1, 0, 0,

    // Right x, y
    0, 0, 0, 1, 1, 1, 1, 0,

    // Bottom x, y
    0, 1, 1, 1, 1, 0, 0, 0,

    // Top x, y
    0, 1, 1, 1, 1, 0, 0, 0,

    // Back x, y
    0, 0, 1, 0, 1, 1, 0, 1,

    // Front x, y
    1, 0, 0, 0, 0, 1, 1, 1
]

const numberSides = 6
const verticesPerSide = 4
const threeDimensions = 3

export function addBoxToVertexData(
    data: IntermediateVertexData,
    node: Node,
    measures: BoxMeasures,
    color: string,
    subGeomIndex: number,
    desc: CodeMapGeometricDescription,
    delta: number
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

    data.uvs.set(uvArray, subGeomIndex * uvArray.length)

    setPositions(data.positions, measures, subGeomIndex)
    setVerticesAndFaces(node, measures, color, delta, subGeomIndex, data)
}

function setPositions(positions: Float32Array, measures: BoxMeasures, index: number) {
    const { x: minPosX, y: minPosY, z: minPosZ, width, height, depth } = measures
    const maxPosX = minPosX + width
    const maxPosY = minPosY + height
    const maxPosZ = minPosZ + depth

    let positionIndex = index * verticesPerSide * numberSides * threeDimensions

    // Left
    // Bottom left
    positions[positionIndex++] = minPosX
    positions[positionIndex++] = minPosY
    positions[positionIndex++] = minPosZ
    // Top left
    positions[positionIndex++] = minPosX
    positions[positionIndex++] = maxPosY
    positions[positionIndex++] = minPosZ
    // Top right
    positions[positionIndex++] = minPosX
    positions[positionIndex++] = maxPosY
    positions[positionIndex++] = maxPosZ
    // Bottom right
    positions[positionIndex++] = minPosX
    positions[positionIndex++] = minPosY
    positions[positionIndex++] = maxPosZ

    // Right
    // Bottom left
    positions[positionIndex++] = maxPosX
    positions[positionIndex++] = minPosY
    positions[positionIndex++] = minPosZ
    // Top left
    positions[positionIndex++] = maxPosX
    positions[positionIndex++] = maxPosY
    positions[positionIndex++] = minPosZ
    // Top right
    positions[positionIndex++] = maxPosX
    positions[positionIndex++] = maxPosY
    positions[positionIndex++] = maxPosZ
    // Bottom right
    positions[positionIndex++] = maxPosX
    positions[positionIndex++] = minPosY
    positions[positionIndex++] = maxPosZ

    // Bottom
    // Bottom left
    positions[positionIndex++] = minPosX
    positions[positionIndex++] = minPosY
    positions[positionIndex++] = minPosZ
    // Top left
    positions[positionIndex++] = minPosX
    positions[positionIndex++] = minPosY
    positions[positionIndex++] = maxPosZ
    // Top right
    positions[positionIndex++] = maxPosX
    positions[positionIndex++] = minPosY
    positions[positionIndex++] = maxPosZ
    // Bottom right
    positions[positionIndex++] = maxPosX
    positions[positionIndex++] = minPosY
    positions[positionIndex++] = minPosZ

    // Top
    // Bottom left
    positions[positionIndex++] = minPosX
    positions[positionIndex++] = maxPosY
    positions[positionIndex++] = minPosZ
    // Top left
    positions[positionIndex++] = minPosX
    positions[positionIndex++] = maxPosY
    positions[positionIndex++] = maxPosZ
    // Top right
    positions[positionIndex++] = maxPosX
    positions[positionIndex++] = maxPosY
    positions[positionIndex++] = maxPosZ
    // Bottom right
    positions[positionIndex++] = maxPosX
    positions[positionIndex++] = maxPosY
    positions[positionIndex++] = minPosZ

    // Back
    // Bottom left
    positions[positionIndex++] = maxPosX
    positions[positionIndex++] = minPosY
    positions[positionIndex++] = maxPosZ
    // Top left
    positions[positionIndex++] = minPosX
    positions[positionIndex++] = minPosY
    positions[positionIndex++] = maxPosZ
    // Top right
    positions[positionIndex++] = minPosX
    positions[positionIndex++] = maxPosY
    positions[positionIndex++] = maxPosZ
    // Bottom right
    positions[positionIndex++] = maxPosX
    positions[positionIndex++] = maxPosY
    positions[positionIndex++] = maxPosZ

    // Front
    // Bottom left
    positions[positionIndex++] = maxPosX
    positions[positionIndex++] = minPosY
    positions[positionIndex++] = minPosZ
    // Top left
    positions[positionIndex++] = minPosX
    positions[positionIndex++] = minPosY
    positions[positionIndex++] = minPosZ
    // Top right
    positions[positionIndex++] = minPosX
    positions[positionIndex++] = maxPosY
    positions[positionIndex++] = minPosZ
    // Bottom right
    positions[positionIndex++] = maxPosX
    positions[positionIndex++] = maxPosY
    positions[positionIndex++] = minPosZ
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
    data: IntermediateVertexData
) {
    const { y: minPosY, height } = measures
    const maxPosY = minPosY + height
    const deltaRelativeToHeight = delta / (maxPosY - minPosY)

    let index = subGeomIndex * numberSides * verticesPerSide
    let vector3Index = index * threeDimensions
    let surfaceStartIndex = subGeomIndex * numberSides * numberSides

    const colors = ColorConverter.getVector3Array(color)

    for (let side = 0; side < numberSides; side++) {
        const topSides = isTopSide(side, node)
        const normal = normals[side]
        const indexBottomLeft = index
        const indexTopLeft = index + 1
        const indexTopRight = index + 2
        const indexBottomRight = index + 3

        data.isHeight.set(topSides, index)

        for (const end = index + verticesPerSide; index < end; index++) {
            data.normals.set(normal, vector3Index)
            data.colors.set(colors, vector3Index)

            vector3Index += threeDimensions

            data.ids[index] = subGeomIndex
            data.deltas[index] = deltaRelativeToHeight
        }

        const dimension = Math.floor(side / 2)
        const positiveFacing = normal[dimension] === 1

        if (positiveFacing) {
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
