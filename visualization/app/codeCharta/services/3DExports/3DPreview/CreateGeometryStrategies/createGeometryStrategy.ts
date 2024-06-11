/* eslint-disable @typescript-eslint/no-empty-interface */
import { GeometryOptions } from "../preview3DPrintMesh"
import { BufferGeometry } from "three"

export abstract class CreateGeometryStrategy {
    constructor() {}
    abstract create(geometryOptions: GeometryOptions): Promise<BufferGeometry>
}
