import { GeometryOptions } from "../preview3DPrintMesh"
import { GeneralMesh } from "./generalMesh"
import { FrontPrintColorChangeStrategy } from "../ColorChangeStrategies/frontPrintColorChangeStrategy"

export abstract class FrontLogo extends GeneralMesh {
    constructor(
        name: string,
        private alignment: "right" | "left"
    ) {
        super(name, new FrontPrintColorChangeStrategy())
    }

    changeRelativeSize(geometryOptions: GeometryOptions) {
        const oldWidth = this.getWidth()
        this.boundingBoxCalculated = false
        const secondRowMeshVisible = geometryOptions.secondRowVisible
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
