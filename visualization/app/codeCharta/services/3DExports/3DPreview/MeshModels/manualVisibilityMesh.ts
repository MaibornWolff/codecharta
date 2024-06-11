/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BufferGeometry, MeshBasicMaterial } from "three"
import { GeometryOptions } from "../preview3DPrintMesh"
import { GeneralMesh } from "./generalMesh"
import { SizeChangeScaleStrategy } from "../SizeChangeStrategies/sizeChangeScaleStrategy"

export class ManualVisibilityMesh extends GeneralMesh {
    minScale: number
    private visibleBecauseOfColor = true
    manualVisibility = true
    minNumberOfColors: number

    constructor(
        manualVisibility = true,
        minNumberOfColors = 2,
        minScale?: number,
        geometry?: BufferGeometry,
        material?: MeshBasicMaterial
    ) {
        const sizeChangeStrategy = new SizeChangeScaleStrategy()
        super(sizeChangeStrategy)
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

    async changeSize(geometryOptions: GeometryOptions, oldWidth: number): Promise<void> {
        await this.sizeChangeStrategy.execute(geometryOptions, {
            oldWidth,
            mesh: this
        })
        this.updateVisibility()
    }

    init(geometryOptions: GeometryOptions): Promise<GeneralMesh> {
        return new Promise(resolve => {
            resolve(this)
        })
    }
}
