import { BufferGeometry, MeshBasicMaterial } from "three"
import { GeometryOptions } from "./preview3DPrintMesh"
import { GeneralMesh } from "./generalMesh"
import { SizeChangeScaleStrategy } from "./SizeChangeStrategies/sizeChangeScaleStrategy"

export class ManualVisibilityMesh extends GeneralMesh {
    minScale: number
    private visibleBecauseOfColor = true
    manualVisibility = true
    minNumberOfColors: number

    constructor(geometry?: BufferGeometry, material?: MeshBasicMaterial, minScale?: number, manualVisibility = true, minNumberOfColors = 2) {
        const createGeometryStrategy = undefined
        const sizeChangeStrategy = new SizeChangeScaleStrategy()
        super(createGeometryStrategy, sizeChangeStrategy)
        this.minScale = minScale
        this.manualVisibility = manualVisibility
        this.minNumberOfColors = minNumberOfColors
        this.geometry = geometry
        this.material = material
    }

    updateVisibilityBecauseOfColor(numberOfColors: number): void {
        this.visibleBecauseOfColor = numberOfColors >= this.minNumberOfColors
        this.updateVisibility()
    }

    updateVisibility(): void {
        this.visible = this.minScale
            ? this.scale.x >= this.minScale && this.visibleBecauseOfColor && this.manualVisibility
            : this.visibleBecauseOfColor && this.manualVisibility
    }

    changeSize(geometryOptions: GeometryOptions, oldWidth: number): Promise<void> {
        return Promise.resolve(undefined)
    }

    init(geometryOptions: GeometryOptions): void {
    }
}
