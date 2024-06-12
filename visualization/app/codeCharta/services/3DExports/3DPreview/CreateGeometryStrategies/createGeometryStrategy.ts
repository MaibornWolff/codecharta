/* eslint-disable @typescript-eslint/no-empty-interface */
import { GeometryOptions } from "../preview3DPrintMesh"
import { BufferGeometry } from "three"

export abstract class CreateGeometryStrategy {
    abstract create(geometryOptions: GeometryOptions): Promise<BufferGeometry>
}
