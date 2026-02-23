import { Node } from "../../../codeCharta.model"
import { CodeMapBuilding } from "./codeMapBuilding"
import { Box3, BufferAttribute, BufferGeometry, Vector3 } from "three"
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

export enum sides {
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

// UV coordinates per face, 4 vertices each (u0,v0, u1,v1, u2,v2, u3,v3)
const faceUVs = {
    left: [1, 0, 1, 1, 0, 1, 0, 0],
    right: [0, 0, 0, 1, 1, 1, 1, 0],
    bottom: [0, 1, 1, 1, 1, 0, 0, 0],
    top: [0, 1, 1, 1, 1, 0, 0, 0],
    back: [0, 0, 1, 0, 1, 1, 0, 1],
    front: [1, 0, 0, 0, 0, 1, 1, 1]
}

const uvArray = [...faceUVs.left, ...faceUVs.right, ...faceUVs.bottom, ...faceUVs.top, ...faceUVs.back, ...faceUVs.front]

const numberSides = 6
const verticesPerSide = 4
const threeDimensions = 3
const indicesPerVisibleFace = 6
const visibleFaces = 5 // skip bottom face — never visible in the treemap
const indicesPerNode = visibleFaces * indicesPerVisibleFace
const verticesPerBox = numberSides * verticesPerSide

export { indicesPerNode, verticesPerBox, numberSides, verticesPerSide }

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

    // Each entry is one face: [bottomLeft, topLeft, topRight, bottomRight] as [x,y,z] tuples.
    // Vertex order and exact values must match the UV and index assignments.
    const faceVertices: ReadonlyArray<ReadonlyArray<readonly [number, number, number]>> = [
        // Left
        [
            [minPosX, minPosY, minPosZ], // bottom left
            [minPosX, maxPosY, minPosZ], // top left
            [minPosX, maxPosY, maxPosZ], // top right
            [minPosX, minPosY, maxPosZ] // bottom right
        ],
        // Right
        [
            [maxPosX, minPosY, minPosZ],
            [maxPosX, maxPosY, minPosZ],
            [maxPosX, maxPosY, maxPosZ],
            [maxPosX, minPosY, maxPosZ]
        ],
        // Bottom
        [
            [minPosX, minPosY, minPosZ],
            [minPosX, minPosY, maxPosZ],
            [maxPosX, minPosY, maxPosZ],
            [maxPosX, minPosY, minPosZ]
        ],
        // Top
        [
            [minPosX, maxPosY, minPosZ],
            [minPosX, maxPosY, maxPosZ],
            [maxPosX, maxPosY, maxPosZ],
            [maxPosX, maxPosY, minPosZ]
        ],
        // Back
        [
            [maxPosX, minPosY, maxPosZ],
            [minPosX, minPosY, maxPosZ],
            [minPosX, maxPosY, maxPosZ],
            [maxPosX, maxPosY, maxPosZ]
        ],
        // Front
        [
            [maxPosX, minPosY, minPosZ],
            [minPosX, minPosY, minPosZ],
            [minPosX, maxPosY, minPosZ],
            [maxPosX, maxPosY, minPosZ]
        ]
    ]

    let positionIndex = index * verticesPerSide * numberSides * threeDimensions

    for (const face of faceVertices) {
        for (const [x, y, z] of face) {
            positions[positionIndex++] = x
            positions[positionIndex++] = y
            positions[positionIndex++] = z
        }
    }
}

const ALL_TOP = [1, 1, 1, 1]
const ALL_SIDE = [0, 0, 0, 0]
const LEFT_RIGHT_PARTIAL = [0, 1, 1, 0]
const BACK_FRONT_PARTIAL = [0, 0, 1, 1]

function isTopSide(side: number, node: Node) {
    if (!node.isLeaf || side === sides.bottom) {
        return ALL_SIDE
    }
    if (side === sides.top) {
        return ALL_TOP
    }
    if (side <= sides.right) {
        return LEFT_RIGHT_PARTIAL
    }
    return BACK_FRONT_PARTIAL
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
    let surfaceStartIndex = subGeomIndex * indicesPerNode

    const colors = ColorConverter.getVector3Array(color)

    for (let side = 0; side < numberSides; side++) {
        const topSides = isTopSide(side, node)
        const normal = normals[side]
        const indexBottomLeft = index
        const indexTopLeft = index + 1
        const indexTopRight = index + 2
        const indexBottomRight = index + 3

        data.isHeight.set(topSides, index)

        for (let i = 0; i < verticesPerSide; i++) {
            data.normals.set(normal, vector3Index)
            data.colors.set(colors, vector3Index)

            vector3Index += threeDimensions

            data.ids[index + i] = subGeomIndex
            data.deltas[index + i] = deltaRelativeToHeight
        }
        index += verticesPerSide

        // Skip bottom face indices intentionally.
        // Three assumptions make this safe:
        //   1. The camera always views the map from above, so the bottom face
        //      is never in the camera frustum.
        //   2. No shadow rendering is implemented, so occluded faces are not
        //      needed for shadow maps or similar passes.
        //   3. Omitting the bottom face saves ~17 % of index buffer space
        //      (6 indices out of 36 per box → 30 per box).
        if (side === sides.bottom) {
            continue
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

        surfaceStartIndex += indicesPerVisibleFace
    }
}

// Unit box [0,1]³ — positions follow the same face/vertex order as setPositions.
// prettier-ignore
const templatePositions = new Float32Array([
    // Left face (vertices 0-3)
    0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1,
    // Right face (vertices 4-7)
    1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1,
    // Bottom face (vertices 8-11)
    0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0,
    // Top face (vertices 12-15)
    0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0,
    // Back face (vertices 16-19)
    1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1,
    // Front face (vertices 20-23)
    1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0
])

// Normals for all 24 vertices (flat-shaded, one normal per face).
// prettier-ignore
const templateNormals = new Float32Array([
    -1,
    0,
    0,
    -1,
    0,
    0,
    -1,
    0,
    0,
    -1,
    0,
    0, // left
    1,
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    0, // right
    0,
    -1,
    0,
    0,
    -1,
    0,
    0,
    -1,
    0,
    0,
    -1,
    0, // bottom
    0,
    1,
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    0,
    1,
    0, // top
    0,
    0,
    -1,
    0,
    0,
    -1,
    0,
    0,
    -1,
    0,
    0,
    -1, // back
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    0,
    1 // front
])

// isHeight marks "top" vertices for leaf buildings (z-fighting offset).
// For non-leaf nodes, a per-instance isLeaf=0 multiplier disables this.
// prettier-ignore
const templateIsHeight = new Float32Array([
    0,
    1,
    1,
    0, // left
    0,
    1,
    1,
    0, // right
    0,
    0,
    0,
    0, // bottom
    1,
    1,
    1,
    1, // top
    0,
    0,
    1,
    1, // back
    0,
    0,
    1,
    1 // front
])

// 30 indices for 5 visible faces (skip bottom).  Winding matches original.
// prettier-ignore
const templateIndices = new Uint32Array([
    0,
    2,
    1,
    0,
    3,
    2, // left   (negative X)
    4,
    5,
    6,
    4,
    6,
    7, // right  (positive X)
    12,
    13,
    14,
    12,
    14,
    15, // top    (positive Y)
    16,
    18,
    17,
    16,
    19,
    18, // back   (negative Z)
    20,
    21,
    22,
    20,
    22,
    23 // front  (positive Z)
])

export { templatePositions, templateNormals, templateIsHeight, templateIndices }

export function createTemplateBoxGeometry(): BufferGeometry {
    const geometry = new BufferGeometry()

    geometry.setAttribute("position", new BufferAttribute(templatePositions, threeDimensions))
    geometry.setAttribute("normal", new BufferAttribute(templateNormals, threeDimensions))
    geometry.setAttribute("uv", new BufferAttribute(new Float32Array(uvArray), 2))
    geometry.setAttribute("isHeight", new BufferAttribute(templateIsHeight, 1))

    geometry.setIndex(new BufferAttribute(templateIndices, 1))

    return geometry
}
