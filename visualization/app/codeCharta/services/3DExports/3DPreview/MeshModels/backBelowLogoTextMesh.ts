import { ManualVisibilityMesh } from "./manualVisibilityMesh"
import { GeometryOptions } from "../preview3DPrintMesh"
import { Font, MeshBasicMaterial, TextGeometry } from "three"
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"

export class BackBelowLogoTextMesh extends ManualVisibilityMesh {

    constructor(public font: Font) {
        super(new DefaultPrintColorChangeStrategy(), true, 2, 0.7)
        this.name = "Back MW Logo"
    }

    init(geometryOptions: GeometryOptions): Promise<BackBelowLogoTextMesh> {
        const ITSNameTextGeometry = new TextGeometry("IT Stabilization & Modernization", {
            font: this.font,
            size: geometryOptions.backTextSize,
            height: geometryOptions.baseplateHeight / 2
        })
        ITSNameTextGeometry.center()

        const ITSUrlTextGeometry = new TextGeometry("maibornwolff.de/service/it-sanierung", {
            font: this.font,
            size: geometryOptions.backTextSize,
            height: geometryOptions.baseplateHeight / 2
        })
        ITSUrlTextGeometry.center()
        ITSUrlTextGeometry.translate(0, -10, 0)

        const textGeometry = BufferGeometryUtils.mergeBufferGeometries([ITSNameTextGeometry, ITSUrlTextGeometry])
        textGeometry.rotateY(Math.PI)

        textGeometry.translate(0, 55, -((geometryOptions.baseplateHeight * 3) / 4))
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
