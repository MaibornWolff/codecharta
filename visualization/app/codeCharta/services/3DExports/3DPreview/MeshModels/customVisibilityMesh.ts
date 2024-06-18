import { GeneralMesh } from "./generalMesh"
import { ColorChangeStrategy } from "../ColorChangeStrategies/colorChangeStrategy"

export abstract class CustomVisibilityMesh extends GeneralMesh {
    currentNumberOfColors: number
    currentWidth: number
    manualVisibility: boolean
    readonly minWidth: number
    readonly minNumberOfColors: number

    constructor(name: string, colorChangeStrategy: ColorChangeStrategy, minScale = 1, manualVisibility = true, minNumberOfColors = 2) {
        super(name, colorChangeStrategy)
        this.minWidth = minScale
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

    setCurrentWidth(width: number): void {
        this.currentWidth = width
        this.updateVisibility()
    }

    updateVisibility(): void {
        //TODO: make private
        const visibleBecauseOfColor = this.currentNumberOfColors ? this.currentNumberOfColors >= this.minNumberOfColors : true
        const visibleBecauseOfWidth = this.currentWidth ? this.currentWidth >= this.minWidth : true
        this.visible = this.manualVisibility && visibleBecauseOfColor && visibleBecauseOfWidth
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
