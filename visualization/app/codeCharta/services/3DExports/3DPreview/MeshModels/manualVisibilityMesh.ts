/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BufferGeometry, MeshBasicMaterial } from "three"
import { GeometryOptions } from "../preview3DPrintMesh"
import { GeneralMesh } from "./generalMesh"
import { SizeChangeScaleStrategy } from "../SizeChangeStrategies/sizeChangeScaleStrategy"
import { ColorChangeStrategy } from "../ColorChangeStrategies/colorChangeStrategy"

export abstract class ManualVisibilityMesh extends GeneralMesh { //TODO: split into two classes
    currentNumberOfColors: number
    manualVisibility: boolean
    readonly minScale: number
    readonly minNumberOfColors: number

    constructor(
        colorChangeStrategy: ColorChangeStrategy,
        manualVisibility = true,
        minNumberOfColors = 2,
        minScale?: number,
        geometry?: BufferGeometry,
        material?: MeshBasicMaterial
    ) {
        const sizeChangeStrategy = new SizeChangeScaleStrategy()
        super(sizeChangeStrategy, colorChangeStrategy)
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

    private updateVisibility(): void {
        const visibleBecauseOfColor = this.currentNumberOfColors ? this.currentNumberOfColors >= this.minNumberOfColors : true
        this.visible = this.minScale
            ? this.scale.x >= this.minScale && visibleBecauseOfColor && this.manualVisibility
            : visibleBecauseOfColor && this.manualVisibility
    }

    async changeSize(geometryOptions: GeometryOptions, oldWidth: number): Promise<void> {
        await this.sizeChangeStrategy.execute(geometryOptions, oldWidth, this)
        this.updateVisibility()
    }

    changeColor(numberOfColors: number) {
        this.setCurrentNumberOfColors(numberOfColors)
        this.colorChangeStrategy.execute(numberOfColors, this)
    }
}
