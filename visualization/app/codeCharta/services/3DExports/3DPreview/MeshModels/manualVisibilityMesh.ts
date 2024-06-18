import { GeneralMesh } from "./generalMesh"
import { ColorChangeStrategy } from "../ColorChangeStrategies/colorChangeStrategy"

export abstract class ManualVisibilityMesh extends GeneralMesh {
    //TODO: split into two classes
    currentNumberOfColors: number
    manualVisibility: boolean
    readonly minScale: number
    readonly minNumberOfColors: number

    constructor(name: string, colorChangeStrategy: ColorChangeStrategy, minScale: number, manualVisibility = true, minNumberOfColors = 2) {
        super(name, colorChangeStrategy)
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
