import { ManualVisibilityMesh } from "./manualVisibilityMesh"
import { GeometryOptions } from "../preview3DPrintMesh"
import { Font, MeshBasicMaterial, TextGeometry } from "three"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"

export class CodeChartaTextMesh extends ManualVisibilityMesh {

    constructor(public font: Font) {
        super(new DefaultPrintColorChangeStrategy(), true, 2, 0.7)
        this.name = "Back MW Logo"
    }

    init(geometryOptions: GeometryOptions): Promise<CodeChartaTextMesh> {
        const textGeometry = new TextGeometry("github.com/MaibornWolff/codecharta", {
            font: this.font,
            size: geometryOptions.backTextSize,
            height: geometryOptions.baseplateHeight / 2
        })
        textGeometry.center()
        textGeometry.rotateY(Math.PI)

        textGeometry.translate(0, 5, -((geometryOptions.baseplateHeight * 3) / 4))
        this.geometry = textGeometry

        this.material = new MeshBasicMaterial()

        this.changeColor(geometryOptions.numberOfColors)
        const oldWidth = 200 * geometryOptions.width / (geometryOptions.width - geometryOptions.mapSideOffset * 2)
        this.changeSize(geometryOptions, oldWidth)

        return new Promise(resolve => {
            resolve(this)
        })
    }
}
