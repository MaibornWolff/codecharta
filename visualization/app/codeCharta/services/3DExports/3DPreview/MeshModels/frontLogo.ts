import { GeometryOptions } from "../preview3DPrintMesh"
import { GeneralMesh } from "./generalMesh"
import { SizeChangeStrategy } from "../SizeChangeStrategies/sizeChangeStrategy"
import { ColorChangeStrategy } from "../ColorChangeStrategies/colorChangeStrategy"

export abstract class FrontLogo extends GeneralMesh {
    constructor(
        sizeChangeStrategy: SizeChangeStrategy,
        colorChangeStrategy: ColorChangeStrategy,
        private alignment: "right" | "left"
    ) {
        super(sizeChangeStrategy, colorChangeStrategy)
    }

    changeRelativeSize(geometryOptions: GeometryOptions, secondRowMeshVisible: boolean) {
        const oldWidth = this.getWidth()
        this.boundingBoxCalculated = false
        const scale = secondRowMeshVisible
            ? (geometryOptions.frontTextSize + geometryOptions.secondRowTextSize) / geometryOptions.frontTextSize
            : 1
        this.scale.x = scale
        this.scale.y = scale
        const secondRowVisibleFactor = secondRowMeshVisible ? -1 : 1
        const alignmentFactor = this.alignment === "left" ? -1 : 1
        this.translateY(secondRowVisibleFactor * geometryOptions.secondRowTextSize)
        const translateXFactor = secondRowMeshVisible ? oldWidth / this.getWidth() : this.getWidth() / oldWidth
        this.translateX(2 * translateXFactor * alignmentFactor * secondRowVisibleFactor)
    }
}
