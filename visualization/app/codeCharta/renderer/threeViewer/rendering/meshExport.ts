import { BufferAttribute, BufferGeometry, InstancedBufferAttribute, InstancedMesh, Matrix4, Mesh, Vector3 } from "three"
import { CodeMapBuilding } from "./codeMapBuilding"
import {
    indicesPerNode,
    templateIndices,
    templateIsHeight,
    templateNormals,
    templatePositions,
    verticesPerBox
} from "./geometryGenerationHelper"

interface InstancedAttributes {
    deltaAttr: InstancedBufferAttribute
    isLeafAttr: InstancedBufferAttribute
    templateUvs: BufferAttribute
}

interface ExportBuffers {
    positions: Float32Array
    normalsOut: Float32Array
    colors: Float32Array
    uvsOut: Float32Array
    isHeightOut: Float32Array
    deltasOut: Float32Array
    deltaColorsOut: Float32Array
    indices: Uint32Array
}

/** The map's buildings as one plain mesh with their default colours, for the 3D print export. */
export function exportMeshOf(threeMesh: InstancedMesh, buildings: readonly CodeMapBuilding[]): Mesh {
    const instanceCount = threeMesh.count
    const attrs = extractInstancedAttributes(threeMesh)
    const buffers = allocateExportBuffers(instanceCount)
    const matrix = new Matrix4()
    const vertex = new Vector3()
    const normal = new Vector3()

    for (let i = 0; i < instanceCount; i++) {
        threeMesh.getMatrixAt(i, matrix)
        transformVertices(i, buildings[i], { matrix, vertex, normal }, attrs, buffers)
        fillIndexBuffer(i, buffers.indices)
    }

    return assembleExportGeometry(threeMesh, buffers)
}

function extractInstancedAttributes(threeMesh: InstancedMesh): InstancedAttributes {
    const deltaAttr = threeMesh.geometry.getAttribute("delta")
    if (!deltaAttr) {
        throw new Error("CodeMapMesh: missing required geometry attribute 'delta'")
    }

    const isLeafAttr = threeMesh.geometry.getAttribute("isLeaf")
    if (!isLeafAttr) {
        throw new Error("CodeMapMesh: missing required geometry attribute 'isLeaf'")
    }

    const templateUvs = threeMesh.geometry.getAttribute("uv")
    if (!templateUvs) {
        throw new Error("CodeMapMesh: missing required geometry attribute 'uv'")
    }

    return {
        deltaAttr: deltaAttr as InstancedBufferAttribute,
        isLeafAttr: isLeafAttr as InstancedBufferAttribute,
        templateUvs: templateUvs as BufferAttribute
    }
}

function allocateExportBuffers(instanceCount: number): ExportBuffers {
    const totalVertices = instanceCount * verticesPerBox
    const totalIndices = instanceCount * indicesPerNode

    return {
        positions: new Float32Array(totalVertices * 3),
        normalsOut: new Float32Array(totalVertices * 3),
        colors: new Float32Array(totalVertices * 3),
        uvsOut: new Float32Array(totalVertices * 2),
        isHeightOut: new Float32Array(totalVertices),
        deltasOut: new Float32Array(totalVertices),
        deltaColorsOut: new Float32Array(totalVertices * 3),
        indices: new Uint32Array(totalIndices)
    }
}

function transformVertices(
    i: number,
    building: CodeMapBuilding,
    scratch: { matrix: Matrix4; vertex: Vector3; normal: Vector3 },
    attrs: InstancedAttributes,
    buffers: ExportBuffers
) {
    const { matrix, vertex, normal } = scratch
    const vertexOffset = i * verticesPerBox
    const posOffset = vertexOffset * 3
    const uvOffset = vertexOffset * 2

    const defaultColor = building.getDefaultColorVector()
    const defaultDeltaColor = building.getDefaultDeltaColorVector()
    const deltaVal = attrs.deltaAttr.getX(i)
    const isLeaf = attrs.isLeafAttr.getX(i)

    for (let v = 0; v < verticesPerBox; v++) {
        vertex.set(templatePositions[v * 3], templatePositions[v * 3 + 1], templatePositions[v * 3 + 2])
        vertex.applyMatrix4(matrix)
        writeVector(buffers.positions, posOffset + v * 3, vertex)

        normal.set(templateNormals[v * 3], templateNormals[v * 3 + 1], templateNormals[v * 3 + 2])
        normal.transformDirection(matrix)
        writeVector(buffers.normalsOut, posOffset + v * 3, normal)

        writeVector(buffers.colors, posOffset + v * 3, defaultColor)
        writeVector(buffers.deltaColorsOut, posOffset + v * 3, defaultDeltaColor)

        buffers.uvsOut[uvOffset + v * 2] = attrs.templateUvs.getX(v)
        buffers.uvsOut[uvOffset + v * 2 + 1] = attrs.templateUvs.getY(v)

        buffers.isHeightOut[vertexOffset + v] = templateIsHeight[v] * isLeaf
        buffers.deltasOut[vertexOffset + v] = deltaVal
    }
}

function writeVector(target: Float32Array, offset: number, vector: Vector3) {
    target[offset] = vector.x
    target[offset + 1] = vector.y
    target[offset + 2] = vector.z
}

function fillIndexBuffer(i: number, indices: Uint32Array) {
    const vertexOffset = i * verticesPerBox
    const indexOffset = i * indicesPerNode
    for (let j = 0; j < indicesPerNode; j++) {
        indices[indexOffset + j] = templateIndices[j] + vertexOffset
    }
}

function assembleExportGeometry(threeMesh: InstancedMesh, buffers: ExportBuffers): Mesh {
    const geometry = new BufferGeometry()
    geometry.setAttribute("position", new BufferAttribute(buffers.positions, 3))
    geometry.setAttribute("normal", new BufferAttribute(buffers.normalsOut, 3))
    geometry.setAttribute("color", new BufferAttribute(buffers.colors, 3))
    geometry.setAttribute("deltaColor", new BufferAttribute(buffers.deltaColorsOut, 3))
    geometry.setAttribute("uv", new BufferAttribute(buffers.uvsOut, 2))
    geometry.setAttribute("isHeight", new BufferAttribute(buffers.isHeightOut, 1))
    geometry.setAttribute("delta", new BufferAttribute(buffers.deltasOut, 1))
    geometry.setIndex(new BufferAttribute(buffers.indices, 1))
    geometry.addGroup(0, Number.POSITIVE_INFINITY, 0)

    const material = threeMesh.material
    return new Mesh(geometry, Array.isArray(material) ? material : [material])
}
