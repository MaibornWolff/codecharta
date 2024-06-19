import { GeneralMesh } from "./generalMesh"
import { ColorChangeStrategy } from "../ColorChangeStrategies/colorChangeStrategy"

export abstract class CustomVisibilityMesh extends GeneralMesh {
    currentWidth: number
    manualVisibility: boolean
    visibleBecauseOfColor: boolean
    readonly minWidth: number

    constructor(name: string, colorChangeStrategy: ColorChangeStrategy, minScale = 1, manualVisibility = true) {
        super(name, colorChangeStrategy)
        this.minWidth = minScale
        this.manualVisibility = manualVisibility
    }

    setManualVisibility(manualVisibility: boolean): void {
        this.manualVisibility = manualVisibility
        this.updateVisibility()
    }

    setCurrentWidth(width: number): void {
        this.currentWidth = width
        this.updateVisibility()
    }

    private updateVisibility(): void {
        const visibleBecauseOfWidth = this.currentWidth ? this.currentWidth >= this.minWidth : true
        this.visible = this.manualVisibility && this.visibleBecauseOfColor && visibleBecauseOfWidth
    }

    updateColor(numberOfColors: number) {
        this.visibleBecauseOfColor = this.colorChangeStrategy.execute(numberOfColors, this)
        for (const child of this.children) {
            if (child instanceof GeneralMesh) {
                child.updateColor(numberOfColors)
            }
        }
        this.updateVisibility()
    }
}
