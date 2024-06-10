import { SizeChangeOptions, SizeChangeStrategy } from "./SizeChangeStrategy"
import { CreateGeometryStrategyParams } from "../CreateGeometryStrategies/createGeometryStrategy"
import { BufferGeometry, Mesh } from "three"

export interface CreateOnSizeChangeOptions extends SizeChangeOptions{
    params: CreateGeometryStrategyParams
    createCallback: (CreateGeometryStrategyParams) => Promise<BufferGeometry>
    object: Mesh
}
export class onSizeChangeCreateStrategy implements SizeChangeStrategy {
    execute({ params, createCallback, object }: CreateOnSizeChangeOptions): Promise<void> {
        createCallback(params).then(geometry => {
            object.geometry = geometry
        })
        return Promise.resolve()
    }
}
