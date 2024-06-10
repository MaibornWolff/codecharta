import { CreateGeometryStrategy, CreateGeometryStrategyParams } from "./createGeometryStrategy"
import { BufferGeometry, ExtrudeGeometry, ShaderMaterial, Shape } from "three"

export interface CreateGeometryBaseplateParams extends CreateGeometryStrategyParams {
    wantedWidth: number,
    secondRowVisible: boolean,
    mapSideOffset: number,
    baseplateHeight: number,
    frontTextSize: number,
    secondRowTextSize: number
}

export class CreateBaseplateStrategy implements CreateGeometryStrategy {
    create({wantedWidth, secondRowVisible, mapSideOffset, baseplateHeight, frontTextSize, secondRowTextSize}: CreateGeometryBaseplateParams): Promise<BufferGeometry> {
        let edgeRadius = 5 // Adjust this value to change the roundness of the corners
        const maxRoundRadius = Math.sqrt(2 * Math.pow(mapSideOffset, 2)) / (Math.sqrt(2) - 1) - 1
        if (maxRoundRadius < edgeRadius) {
            edgeRadius = maxRoundRadius
        }

        // Create the shape
        const shape = new Shape()
        const width = wantedWidth
        const additionalSecondRowDepth = secondRowVisible ? secondRowTextSize * 1.5 : 0
        const depth = wantedWidth + frontTextSize + additionalSecondRowDepth

        shape.absarc(width - edgeRadius, edgeRadius, edgeRadius, Math.PI * 1.5, Math.PI * 2, false)
        shape.absarc(width - edgeRadius, depth - edgeRadius, edgeRadius, 0, Math.PI * 0.5, false)
        shape.absarc(edgeRadius, depth - edgeRadius, edgeRadius, Math.PI * 0.5, Math.PI, false)
        shape.absarc(edgeRadius, edgeRadius, edgeRadius, Math.PI, Math.PI * 1.5, false)

        // Create the geometry
        const geometry = new ExtrudeGeometry(shape, { depth: baseplateHeight, bevelEnabled: false })
        geometry.translate(-width / 2, -width / 2 - frontTextSize - additionalSecondRowDepth, -baseplateHeight)

        return Promise.resolve(geometry)
    }

}
