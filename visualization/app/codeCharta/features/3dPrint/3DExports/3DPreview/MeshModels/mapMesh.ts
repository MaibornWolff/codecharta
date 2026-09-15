import { BufferAttribute, BufferGeometry, Float32BufferAttribute, InterleavedBufferAttribute, Mesh } from "three"
import { indicesPerNode } from "../../../../../renderer/threeViewer/threeViewer.facade"
import { BackPrintColorChangeStrategy } from "../ColorChangeStrategies/backPrintColorChangeStrategy"
import { GeometryOptions } from "../geometryOptions"
import { CustomVisibilityMesh } from "./customVisibilityMesh"

function isGrey(colorR: number, colorG: number, colorB: number) {
    return colorR === colorB && colorR === colorG && colorG === colorB
}

export class MapMesh extends CustomVisibilityMesh {
    private originalColors: BufferAttribute | InterleavedBufferAttribute

    constructor() {
        super("Map", new BackPrintColorChangeStrategy(), 1, false)
    }

    async init(geometryOptions: GeometryOptions): Promise<MapMesh> {
        this.material = (geometryOptions.originalMapMesh.clone() as Mesh).material
        this.originalColors = geometryOptions.originalMapMesh.geometry.attributes.color
        const newMapGeometry = geometryOptions.originalMapMesh.geometry.clone()
        this.addBottomFaces(newMapGeometry)
        newMapGeometry.computeBoundingBox()
        newMapGeometry.rotateX(Math.PI / 2)
        this.updateMapGeometry(geometryOptions, newMapGeometry)
        newMapGeometry.computeBoundingBox() // Ensure the bounding box is computed again after transformations
        newMapGeometry.rotateZ(-Math.PI / 2)
        this.geometry = newMapGeometry

        return this
    }

    private updateMapGeometry(geometryOptions: GeometryOptions, map: BufferGeometry): BufferGeometry {
        const width = geometryOptions.width - 2 * geometryOptions.mapSideOffset

        const normalizeFactor = map.boundingBox.max.x
        const scale = width / normalizeFactor
        map.scale(scale, scale, scale)

        map.translate(-width / 2, width / 2, 0)

        this.updateMapColors(this.originalColors, map, geometryOptions.numberOfColors)

        return map
    }

    private updateMapColors(
        originalColors: BufferAttribute | InterleavedBufferAttribute,
        previewMap: BufferGeometry,
        numberOfColors: number
    ) {
        const newColors = []
        for (let index = 0; index < originalColors.count; index++) {
            const colorR = originalColors.getX(index)
            const colorG = originalColors.getY(index)
            const colorB = originalColors.getZ(index)
            newColors.push(...this.getPrintColor(colorR, colorG, colorB, numberOfColors))
        }
        previewMap.setAttribute("color", new Float32BufferAttribute(newColors, 3))
    }

    private getPrintColor(colorR: number, colorG: number, colorB: number, numberOfColors: number): number[] {
        if (isGrey(colorR, colorG, colorB)) {
            //all grey values
            return numberOfColors === 1 ? [1, 1, 1] : [0.5, 0.5, 0.5]
        }
        if (colorR > 0.75 && colorG > 0.75) {
            //yellow
            return numberOfColors < 4 ? [1, 1, 1] : [1, 1, 0]
        }
        if (colorR > 0.45 && colorG < 0.1) {
            //red
            return numberOfColors < 4 ? [1, 1, 1] : [1, 0, 0]
        }
        if (colorR < 5 && colorG > 0.6) {
            //green
            return numberOfColors < 4 ? [1, 1, 1] : [0, 1, 0]
        }
        console.error("Unknown color")
        return [1, 1, 1]
    }

    private addBottomFaces(geometry: BufferGeometry) {
        const oldIndex = geometry.index
        if (!oldIndex) {
            return
        }

        const verticesPerBox = 24 // 6 sides × 4 vertices
        const bottomFaceIndicesCount = 6 // 2 triangles for the bottom face
        const bottomFaceVertexOffset = 8 // bottom face starts at vertex 8 within each box

        const numBoxes = oldIndex.count / indicesPerNode
        const newIndexArray = new Uint32Array(oldIndex.count + numBoxes * bottomFaceIndicesCount)
        newIndexArray.set(new Uint32Array(oldIndex.array.buffer, oldIndex.array.byteOffset, oldIndex.count))

        let writeOffset = oldIndex.count
        for (let box = 0; box < numBoxes; box++) {
            const base = box * verticesPerBox + bottomFaceVertexOffset
            // Negative-facing Y winding order (matching the original geometry generator)
            newIndexArray[writeOffset++] = base
            newIndexArray[writeOffset++] = base + 2
            newIndexArray[writeOffset++] = base + 1
            newIndexArray[writeOffset++] = base
            newIndexArray[writeOffset++] = base + 3
            newIndexArray[writeOffset++] = base + 2
        }

        geometry.setIndex(new BufferAttribute(newIndexArray, 1))
    }

    async changeSize(geometryOptions: GeometryOptions, oldWidth: number): Promise<void> {
        const scale = (geometryOptions.width - 2 * geometryOptions.mapSideOffset) / (oldWidth - 2 * geometryOptions.mapSideOffset)
        this.geometry.scale(scale, scale, scale)
    }

    updateColor(numberOfColors: number) {
        this.updateMapColors(this.originalColors, this.geometry, numberOfColors)
    }
}
