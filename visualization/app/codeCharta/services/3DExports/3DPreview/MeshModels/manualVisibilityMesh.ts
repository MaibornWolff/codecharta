/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BufferGeometry, MeshBasicMaterial } from "three"
import { GeometryOptions } from "../preview3DPrintMesh"
import { GeneralMesh } from "./generalMesh"
import { SizeChangeScaleStrategy } from "../SizeChangeStrategies/sizeChangeScaleStrategy"

export class ManualVisibilityMesh extends GeneralMesh { //TODO: split into two classes
    currentNumberOfColors: number
    manualVisibility: boolean
    readonly minScale: number
    readonly minNumberOfColors: number

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

    setSizeChangeStrategy(sizeChangeStrategy: SizeChangeScaleStrategy): void { //TODO: delete this function and integrate into constructor
        this.sizeChangeStrategy = sizeChangeStrategy
    }

    setManualVisibility(manualVisibility: boolean): void {
        this.manualVisibility = manualVisibility
        this.updateVisibility()
    }
    getManualVisibility(): boolean {
        return this.manualVisibility
    }

    setCurrentNumberOfColors(numberOfColors: number): void {
        this.currentNumberOfColors = numberOfColors
        this.updateVisibility()
    }

    updateVisibility(): void { //TODO: make private
        const visibleBecauseOfColor = this.currentNumberOfColors ? this.currentNumberOfColors >= this.minNumberOfColors : true
        this.visible = this.minScale
            ? this.scale.x >= this.minScale && visibleBecauseOfColor && this.manualVisibility
            : visibleBecauseOfColor && this.manualVisibility
    }

    async changeSize(geometryOptions: GeometryOptions, oldWidth: number): Promise<void> {
        await this.sizeChangeStrategy.execute(geometryOptions, oldWidth, this)
        this.updateVisibility()
    }

    init(geometryOptions: GeometryOptions): Promise<GeneralMesh> {
        return new Promise(resolve => {
            resolve(this)
        })
    }
}
