import { strToU8, zipSync } from "fflate"
import { BufferGeometry, Float32BufferAttribute, Material, Matrix4, Mesh, MeshBasicMaterial, ShaderMaterial, Vector3 } from "three"
import { getXMLrelationships, getXMLcontentType } from "./generateXML/build3mfStatics"
import { getXMLmodelConfig } from "./generateXML/build3mfModelConfig"
import { getXMLmodel } from "./generateXML/build3mfModel"

export interface Volume {
    id: number
    name: string
    color: string
    extruder: number
    firstTriangleId: number
    lastTriangleId: number
}

export async function serialize3mf(mesh: Mesh): Promise<string> {
    const { vertices, triangles, volumes } = extractMeshData(mesh)
    const model = getXMLmodel(vertices, triangles)
    const modelConfig = getXMLmodelConfig(volumes)
    const contentType = getXMLcontentType()
    const relationships = getXMLrelationships()

    const data = {
        "3D": {
            "3dmodel.model": strToU8(model)
        },
        _rels: {
            ".rels": strToU8(relationships)
        },
        Metadata: {
            "Slic3r_PE_model.config": strToU8(modelConfig)
        },
        "[Content_Types].xml": strToU8(contentType)
    }
    const options = {
        comment: "created by CodeCharta"
    }

    const compressed3mf = zipSync(data, options).buffer
    return compressed3mf as unknown as string
}

function extractMeshData(mesh: Mesh): {
    vertices: string[]
    triangles: string[]
    volumes: Volume[]
} {
    const vertices: string[] = []
    const triangles: string[] = []
    const volumes: Volume[] = []
    const vertexToNewVertexIndex: Map<string, number> = new Map()
    const colorToExtruder: Map<string, number> = new Map()
    const volumeCount = 1

    for (const child of mesh.children as Mesh[]) {
        extractChildMeshData(child, vertices, triangles, vertexToNewVertexIndex, volumeCount, colorToExtruder, volumes)
    }

    return { vertices, triangles, volumes }
}

function extractChildMeshData(
    mesh: Mesh,
    vertices: string[],
    triangles: string[],
    vertexToNewVertexIndex: Map<string, number>,
    volumeCount: number,
    colorToExtruder: Map<string, number>,
    volumes: Volume[],
    parentMatrix: Matrix4 = undefined
): void {
    if (!mesh.visible) {
        return
    }
    for (const child of mesh.children as Mesh[]) {
        let newParentMatrix = mesh.matrix
        if (parentMatrix) {
            newParentMatrix = parentMatrix.clone().multiply(mesh.matrix)
        }
        extractChildMeshData(child, vertices, triangles, vertexToNewVertexIndex, volumeCount, colorToExtruder, volumes, newParentMatrix)
    }

    const colorToVertexIndices = groupMeshVerticesByColor(mesh)
    const vertexIndexToNewVertexIndex: Map<number, number> = new Map()

    for (const [color, vertexIndexes] of colorToVertexIndices.entries()) {
        const firstTriangleId = triangles.length

        constructVertices(vertices, vertexToNewVertexIndex, vertexIndexToNewVertexIndex, vertexIndexes, mesh, parentMatrix)

        constructTriangles(mesh.geometry, triangles, vertexIndexToNewVertexIndex, vertexIndexes)

        constructVolume(mesh, color, firstTriangleId, triangles.length - 1, volumes, volumeCount, colorToExtruder)
        volumeCount++
    }
}

function groupMeshVerticesByColor(mesh: Mesh): Map<string, number[]> {
    const colorToVertexIndices: Map<string, number[]> = new Map()
    if (mesh.geometry.attributes.color) {
        for (let index = 0; index < mesh.geometry.attributes.color.count; index++) {
            const hexColorString = convertColorArrayToHexString(mesh.geometry.attributes.color as Float32BufferAttribute, index)

            if (colorToVertexIndices.has(hexColorString)) {
                colorToVertexIndices.get(hexColorString).push(index)
            } else {
                colorToVertexIndices.set(hexColorString, [index])
            }
        }
    } else {
        const material = mesh.material as Material
        let hexColorString: string
        if ((material as MeshBasicMaterial).color) {
            hexColorString = (material as MeshBasicMaterial).color.getHexString()
        } else if ((material as ShaderMaterial).isShaderMaterial) {
            const colorArray = (material as ShaderMaterial).defaultAttributeValues.color
            hexColorString = convertColorArrayToHexString(colorArray, 0)
        }
        const indexArray = Array.from({ length: mesh.geometry.attributes.position.count }, (_, index) => index)

        if (colorToVertexIndices.has(hexColorString)) {
            colorToVertexIndices.get(hexColorString).push(...indexArray)
        } else {
            colorToVertexIndices.set(hexColorString, indexArray)
        }
    }
    return colorToVertexIndices
}

function constructVertices(
    vertices: string[],
    vertexToNewVertexIndex: Map<string, number>,
    vertexIndexToNewVertexIndex: Map<number, number>,
    vertexIndexes: number[],
    mesh: Mesh,
    parentMatrix: Matrix4
) {
    const positionAttribute = mesh.geometry.attributes.position
    for (const vertexIndex of vertexIndexes) {
        const vertex = new Vector3(
            positionAttribute.getX(vertexIndex) * mesh.scale.x,
            positionAttribute.getY(vertexIndex) * mesh.scale.y,
            positionAttribute.getZ(vertexIndex) * mesh.scale.z
        )
        if (parentMatrix) {
            vertex.applyMatrix4(parentMatrix)
        }
        vertex.add(mesh.position)

        const vertexString = `<vertex x="${vertex.x}" y="${vertex.y}" z="${vertex.z}"/>`

        if (!vertexToNewVertexIndex.has(vertexString)) {
            vertices.push(vertexString)
            vertexToNewVertexIndex.set(vertexString, vertices.length - 1)
            vertexIndexToNewVertexIndex.set(vertexIndex, vertices.length - 1)
        } else {
            vertexIndexToNewVertexIndex.set(vertexIndex, vertexToNewVertexIndex.get(vertexString))
        }
    }

    return
}

function constructTriangles(
    geometry: BufferGeometry,
    triangles: string[],
    vertexIndexToNewVertexIndex: Map<number, number>,
    vertexIndexes: number[]
): void {
    if (!geometry.index) {
        for (let index = 0; index < vertexIndexToNewVertexIndex.size; index += 3) {
            const triangle = `<triangle v1="${vertexIndexToNewVertexIndex.get(index)}" v2="${vertexIndexToNewVertexIndex.get(
                index + 1
            )}" v3="${vertexIndexToNewVertexIndex.get(index + 2)}" />`
            triangles.push(triangle)
        }
    } else {
        const vertexIndices = geometry.index
        for (let index = 0; index < vertexIndices.count; index += 3) {
            const vertexIndex1 = vertexIndices.getX(index)
            const vertexIndex2 = vertexIndices.getY(index)
            const vertexIndex3 = vertexIndices.getZ(index)

            if (vertexIndexes.includes(vertexIndex1) && vertexIndexes.includes(vertexIndex2) && vertexIndexes.includes(vertexIndex3)) {
                const triangle = `<triangle v1="${vertexIndexToNewVertexIndex.get(vertexIndex1)}" v2="${vertexIndexToNewVertexIndex.get(
                    vertexIndex2
                )}" v3="${vertexIndexToNewVertexIndex.get(vertexIndex3)}" />`

                triangles.push(triangle)
            }
        }
    }
}

function constructVolume(
    child: Mesh,
    color: string,
    firstTriangleId: number,
    lastTriangleId: number,
    volumes: Volume[],
    volumeCount: number,
    colorToExtruder: Map<string, number>
): void {
    if (!colorToExtruder.has(color)) {
        colorToExtruder.set(color, colorToExtruder.size + 1)
    }
    const extruder = colorToExtruder.get(color)
    const volumeName = child.name === "Map" ? `${child.name} 0x${color}` : child.name
    const volume: Volume = {
        id: volumeCount,
        name: volumeName,
        color,
        extruder,
        firstTriangleId,
        lastTriangleId
    }
    volumes.push(volume)
}

function convertColorArrayToHexString(color: Float32BufferAttribute | number[], index: number): string {
    const colorsArray: number[] =
        color instanceof Float32BufferAttribute
            ? [
                  (color as Float32BufferAttribute).getX(index),
                  (color as Float32BufferAttribute).getY(index),
                  (color as Float32BufferAttribute).getZ(index)
              ]
            : [color[index], color[index + 1], color[index + 2]]

    return colorsArray
        .map(c =>
            Math.round(c * 255)
                .toString(16)
                .padStart(2, "0")
        )
        .join("")
}

export const exportedForTesting = {
    constructTriangles,
    constructVolume,
    convertColorArrayToHexString
}
