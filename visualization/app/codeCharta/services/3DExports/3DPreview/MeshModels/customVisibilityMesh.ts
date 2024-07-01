import { GeneralMesh } from "./generalMesh"
import { ColorChangeStrategy } from "../ColorChangeStrategies/colorChangeStrategy"

export abstract class CustomVisibilityMesh extends GeneralMesh {
    currentWidth: number
    visibleBecauseOfColor: boolean

    constructor(
        name: string,
        colorChangeStrategy: ColorChangeStrategy,
        public minWidth = 1,
        public manualVisibility = true
    ) {
        super(name, colorChangeStrategy)
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
