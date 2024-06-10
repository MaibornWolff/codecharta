import { BufferGeometry, Mesh, MeshBasicMaterial } from "three"
import { GeneralMesh } from "./generalMesh"
import { CreateGeometryStrategyParams } from "./CreateGeometryStrategies/createGeometryStrategy"

export class ManualVisibilityMesh extends GeneralMesh {
    minScale: number
    private visibleBecauseOfColor = true
    manualVisibility = true
    minNumberOfColors: number

    constructor(geometry?: BufferGeometry, material?: MeshBasicMaterial, minScale?: number, manualVisibility = true, minNumberOfColors = 2) {
        super(geometry, material)
        this.minScale = minScale
        this.manualVisibility = manualVisibility
        this.minNumberOfColors = minNumberOfColors
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

    onSizeChangeStrategy(createGeometryStrategyParams: CreateGeometryStrategyParams): Promise<void> {
        return Promise.resolve()
    }
}
