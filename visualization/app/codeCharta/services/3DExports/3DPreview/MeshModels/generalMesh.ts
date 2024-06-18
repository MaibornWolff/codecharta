import { Mesh } from "three"
import { GeometryOptions } from "../preview3DPrintMesh"
import { ColorChangeStrategy } from "../ColorChangeStrategies/colorChangeStrategy"

export interface GeneralSizeChangeMesh {
    changeSize(geometryOptions: GeometryOptions, oldWidth: number): Promise<void>
}
export abstract class GeneralMesh extends Mesh {
    boundingBoxCalculated: boolean

    constructor(
        name: string,
        public colorChangeStrategy: ColorChangeStrategy
    ) {
        super()
        this.name = name
        this.boundingBoxCalculated = false
    }

    abstract init(geometryOptions: GeometryOptions): Promise<GeneralMesh>
    changeColor(numberOfColors: number): void {
        this.colorChangeStrategy.execute(numberOfColors, this)
        for (const child of this.children) {
            if (child instanceof GeneralMesh) {
                child.changeColor(numberOfColors)
            }
        }
    }

    getWidth(): number {
        this.updateBoundingBox()
        return this.geometry.boundingBox.max.x - this.geometry.boundingBox.min.x
    }
    getHeight(): number {
        this.updateBoundingBox()
        return this.geometry.boundingBox.max.z - this.geometry.boundingBox.min.z
    }
    getDepth(): number {
        this.updateBoundingBox()
        return this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y
    }

    isGeneralSizeChangeMesh(): this is GeneralSizeChangeMesh {
        return "changeSize" in this
    }

    private updateBoundingBox() {
        if (!this.boundingBoxCalculated) {
            this.geometry.computeBoundingBox()
            this.boundingBoxCalculated = true
        }
    }
}
