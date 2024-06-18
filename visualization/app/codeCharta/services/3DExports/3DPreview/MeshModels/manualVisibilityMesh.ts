/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { GeometryOptions } from "../preview3DPrintMesh"
import { GeneralMesh } from "./generalMesh"
import { SizeChangeScaleStrategyOptions } from "../SizeChangeStrategies/sizeChangeScaleStrategy"
import { ColorChangeStrategy } from "../ColorChangeStrategies/colorChangeStrategy"
import { SizeChangeStrategy } from "../SizeChangeStrategies/sizeChangeStrategy"

export abstract class ManualVisibilityMesh extends GeneralMesh {
    //TODO: split into two classes
    currentNumberOfColors: number
    manualVisibility: boolean
    readonly minScale: number
    readonly minNumberOfColors: number

    constructor(
        name: string,
        sizeChangeStrategy: SizeChangeStrategy,
        colorChangeStrategy: ColorChangeStrategy,
        minScale: number,
        manualVisibility = true,
        minNumberOfColors = 2
    ) {
        super(name, sizeChangeStrategy, colorChangeStrategy)
        this.minScale = minScale
        this.manualVisibility = manualVisibility
        this.minNumberOfColors = minNumberOfColors
    }

    setManualVisibility(manualVisibility: boolean): void {
        this.manualVisibility = manualVisibility
        this.updateVisibility()
    }

    setCurrentNumberOfColors(numberOfColors: number): void {
        this.currentNumberOfColors = numberOfColors
        this.updateVisibility()
    }

    updateVisibility(): void {
        //TODO: make private
        const visibleBecauseOfColor = this.currentNumberOfColors ? this.currentNumberOfColors >= this.minNumberOfColors : true
        this.visible = this.minScale
            ? this.scale.x >= this.minScale && visibleBecauseOfColor && this.manualVisibility
            : visibleBecauseOfColor && this.manualVisibility
    }

    async changeSize(geometryOptions: GeometryOptions, oldWidth: number): Promise<void> {
        await this.sizeChangeStrategy.execute(geometryOptions, { mesh: this, oldWidth } as SizeChangeScaleStrategyOptions)
        this.updateVisibility()
    }

    changeColor(numberOfColors: number) {
        this.setCurrentNumberOfColors(numberOfColors)
        this.colorChangeStrategy.execute(numberOfColors, this)
        for (const child of this.children) {
            if (child instanceof GeneralMesh) {
                child.changeColor(numberOfColors)
            }
        }
    }
}
