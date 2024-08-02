import { CustomVisibilityMesh } from "./customVisibilityMesh"
import { GeometryOptions } from "../preview3DPrintMesh"
import { BackPrintColorChangeStrategy } from "../ColorChangeStrategies/backPrintColorChangeStrategy"
import { BufferAttribute, BufferGeometry, Float32BufferAttribute, InterleavedBufferAttribute, Mesh } from "three"

export class MapMesh extends CustomVisibilityMesh {
    private originalColors: BufferAttribute | InterleavedBufferAttribute

    constructor() {
        super("Map", new BackPrintColorChangeStrategy(), 1, false)
    }

    async init(geometryOptions: GeometryOptions): Promise<MapMesh> {
        this.material = (geometryOptions.originalMapMesh.clone() as Mesh).material
        this.originalColors = geometryOptions.originalMapMesh.geometry.attributes.color
        const newMapGeometry = geometryOptions.originalMapMesh.geometry.clone()
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
            let newColor: number[]

            if (colorR === colorB && colorR === colorG && colorG === colorB) {
                //all grey values
                newColor = numberOfColors === 1 ? [1, 1, 1] : [0.5, 0.5, 0.5]
            } else if (colorR > 0.75 && colorG > 0.75) {
                //yellow
                newColor = numberOfColors < 4 ? [1, 1, 1] : [1, 1, 0]
            } else if (colorR > 0.45 && colorG < 0.1) {
                //red
                newColor = numberOfColors < 4 ? [1, 1, 1] : [1, 0, 0]
            } else if (colorR < 5 && colorG > 0.6) {
                //green
                newColor = numberOfColors < 4 ? [1, 1, 1] : [0, 1, 0]
            } else {
                console.error("Unknown color")
                newColor = [1, 1, 1]
            }
            newColors.push(...newColor)
        }
        previewMap.setAttribute("color", new Float32BufferAttribute(newColors, 3))
    }

    async changeSize(geometryOptions: GeometryOptions, oldWidth: number): Promise<void> {
        const scale = (geometryOptions.width - 2 * geometryOptions.mapSideOffset) / (oldWidth - 2 * geometryOptions.mapSideOffset)
        this.geometry.scale(scale, scale, scale)
        return
    }
    updateColor(numberOfColors: number) {
        this.updateMapColors(this.originalColors, this.geometry, numberOfColors)
    }
}
