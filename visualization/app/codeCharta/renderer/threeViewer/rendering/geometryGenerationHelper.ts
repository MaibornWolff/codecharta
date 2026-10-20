import { BufferAttribute, BufferGeometry } from "three"

export interface BoxMeasures {
    x: number
    y: number
    z: number
    width: number
    height: number
    depth: number
}

const faces = ["left", "right", "bottom", "top", "back", "front"] as const
type Face = (typeof faces)[number]

const numberSides = faces.length
const verticesPerSide = 4
const threeDimensions = 3
const indicesPerVisibleFace = 6
const visibleFaces = 5 // skip bottom face — never visible in the treemap
const indicesPerNode = visibleFaces * indicesPerVisibleFace
const verticesPerBox = numberSides * verticesPerSide

export { indicesPerNode, verticesPerBox }

const unitBoxPositionsPerFace: Record<Face, number[]> = {
    left: [0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1],
    right: [1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    bottom: [0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0],
    top: [0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0],
    back: [1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1],
    front: [1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0]
}

const normalPerFace: Record<Face, number[]> = {
    left: [-1, 0, 0],
    right: [1, 0, 0],
    bottom: [0, -1, 0],
    top: [0, 1, 0],
    back: [0, 0, -1],
    front: [0, 0, 1]
}

const uvsPerFace: Record<Face, number[]> = {
    left: [1, 0, 1, 1, 0, 1, 0, 0],
    right: [0, 0, 0, 1, 1, 1, 1, 0],
    bottom: [0, 1, 1, 1, 1, 0, 0, 0],
    top: [0, 1, 1, 1, 1, 0, 0, 0],
    back: [0, 0, 1, 0, 1, 1, 0, 1],
    front: [1, 0, 0, 0, 0, 1, 1, 1]
}

// isHeight marks "top" vertices for leaf buildings (z-fighting offset).
// For non-leaf nodes, a per-instance isLeaf=0 multiplier disables this.
const isHeightPerFace: Record<Face, number[]> = {
    left: [0, 1, 1, 0],
    right: [0, 1, 1, 0],
    bottom: [0, 0, 0, 0],
    top: [1, 1, 1, 1],
    back: [0, 0, 1, 1],
    front: [0, 0, 1, 1]
}

const triangleIndicesPerVisibleFace: Record<Exclude<Face, "bottom">, number[]> = {
    left: [0, 2, 1, 0, 3, 2],
    right: [4, 5, 6, 4, 6, 7],
    top: [12, 13, 14, 12, 14, 15],
    back: [16, 18, 17, 16, 19, 18],
    front: [20, 21, 22, 20, 22, 23]
}

function concatInFaceOrder(valuesPerFace: Record<Face, number[]>): number[] {
    return faces.flatMap(face => valuesPerFace[face])
}

function normalForEveryVertex(face: Face): number[] {
    return Array.from({ length: verticesPerSide }, () => normalPerFace[face]).flat()
}

const uvArray = concatInFaceOrder(uvsPerFace)
const templatePositions = new Float32Array(concatInFaceOrder(unitBoxPositionsPerFace))
const templateNormals = new Float32Array(faces.flatMap(face => normalForEveryVertex(face)))
const templateIsHeight = new Float32Array(concatInFaceOrder(isHeightPerFace))
const templateIndices = new Uint32Array(Object.values(triangleIndicesPerVisibleFace).flat())

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
