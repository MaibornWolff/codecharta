import { GeometryOptions } from "../preview3DPrintMesh"
import { GeneralMesh } from "./generalMesh"

export abstract class FrontLogo extends GeneralMesh {
    changeRelativeSize(geometryOptions: GeometryOptions, secondRowMeshVisible: boolean) {
        const scale = secondRowMeshVisible
            ? (geometryOptions.frontTextSize + geometryOptions.secondRowTextSize) / geometryOptions.frontTextSize
            : 1
        this.scale.x = scale
        this.scale.y = scale
        this.translateY(secondRowMeshVisible ? -geometryOptions.secondRowTextSize : geometryOptions.secondRowTextSize)
    }
}
