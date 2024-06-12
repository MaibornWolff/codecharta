/* eslint-disable @typescript-eslint/no-empty-interface */
import { GeometryOptions } from "../preview3DPrintMesh"
import { BufferGeometry } from "three"

export interface CreateGeometryStrategyOptions {}
export interface CreateGeometryStrategy {
    create(geometryOptions: GeometryOptions, strategyOptions?: CreateGeometryStrategyOptions): Promise<BufferGeometry>
}
