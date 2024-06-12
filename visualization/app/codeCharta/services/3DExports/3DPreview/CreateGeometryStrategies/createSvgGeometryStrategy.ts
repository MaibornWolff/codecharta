/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BufferGeometry, ExtrudeGeometry } from "three"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader"
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils"
import { CreateGeometryStrategy, CreateGeometryStrategyOptions } from "./createGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"

export interface CreateSvgGeometryStrategyOptions extends CreateGeometryStrategyOptions {
    filePath: string
}
export class CreateSvgGeometryStrategy implements CreateGeometryStrategy {
    async create(
        geometryOptions: GeometryOptions,
        createSvgGeometryStrategyOptions: CreateSvgGeometryStrategyOptions
    ): Promise<BufferGeometry> {
        const filePath = createSvgGeometryStrategyOptions.filePath
        const loader = new SVGLoader()
        return new Promise((resolve, reject) => {
            loader.load(
                filePath,
                function (data) {
                    const paths = data.paths
                    const geometries: BufferGeometry[] = []

                    for (const path of paths) {
                        const shapes = path.toShapes(false, true)

                        for (const shape of shapes) {
                            const geometry = new ExtrudeGeometry(shape, {
                                depth: 1,
                                bevelEnabled: false
                            })
                            geometries.push(geometry)
                        }
                    }

                    const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries)

                    mergedGeometry.computeBoundingBox()
                    const width = mergedGeometry.boundingBox.max.x - mergedGeometry.boundingBox.min.x
                    const depth = mergedGeometry.boundingBox.max.y - mergedGeometry.boundingBox.min.y
                    const scale = 1 / Math.max(width, depth)
                    mergedGeometry.scale(scale, scale, 1)

                    resolve(mergedGeometry)
                },
                undefined,
                function (error) {
                    console.error(`Error loading ${filePath}`)
                    reject(error)
                }
            )
        })
    }
}
