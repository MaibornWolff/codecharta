import { BufferAttribute, BufferGeometry } from "three"

export interface BoxMeasures {
    x: number
    y: number
    z: number
    width: number
    height: number
    depth: number
}

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

export { indicesPerNode, verticesPerBox }

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
