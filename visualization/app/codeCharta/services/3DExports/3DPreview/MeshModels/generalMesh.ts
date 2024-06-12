import { Mesh } from "three"
import { SizeChangeStrategy } from "../SizeChangeStrategies/sizeChangeStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"
import { ColorChangeStrategy } from "../ColorChangeStrategies/colorChangeStrategy"

export abstract class GeneralMesh extends Mesh {
    boundingBoxCalculated = false

    constructor(
        public sizeChangeStrategy: SizeChangeStrategy,
        public colorChangeStrategy: ColorChangeStrategy
    ) {
        super()
    }

    abstract init(geometryOptions: GeometryOptions): Promise<GeneralMesh>
    abstract changeSize(geometryOptions: GeometryOptions, oldWidth: number): Promise<void>
    changeColor(numberOfColors: number): void {
        this.colorChangeStrategy.execute(numberOfColors, this)
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
    private updateBoundingBox() {
        if (!this.boundingBoxCalculated) {
            this.geometry.computeBoundingBox()
            this.boundingBoxCalculated = true
        }
    }
}
