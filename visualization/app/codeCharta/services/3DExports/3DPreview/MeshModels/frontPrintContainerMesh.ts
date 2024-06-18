import { GeometryOptions } from "../preview3DPrintMesh"
import { GeneralMesh, GeneralSizeChangeMesh } from "./generalMesh"
import { SizeChangeScaleStrategy, SizeChangeScaleStrategyOptions } from "../SizeChangeStrategies/sizeChangeScaleStrategy"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"
import { Font } from "three"
import { FrontTextMesh } from "./frontTextMesh"
import { SecondRowTextMesh } from "./secondRowTextMesh"
import { FrontMWLogoMesh } from "./frontMWLogoMesh"
import { CustomLogoMesh } from "./customLogoMesh"

export class FrontPrintContainerMesh extends GeneralMesh implements GeneralSizeChangeMesh {
    private childrenMeshes: Map<string, GeneralMesh>

    constructor(private font: Font) {
        const sizeChangeStrategy = new SizeChangeScaleStrategy()
        const colorChangeStrategy = new DefaultPrintColorChangeStrategy()
        super("FrontPrintContainer", sizeChangeStrategy, colorChangeStrategy)
    }

    async init(geometryOptions: GeometryOptions): Promise<FrontPrintContainerMesh> {
        this.childrenMeshes = new Map<string, GeneralMesh>()
        this.childrenMeshes.set("FrontText", new FrontTextMesh("FrontText", this.font, geometryOptions))
        this.childrenMeshes.set("SecondRowText", new SecondRowTextMesh("SecondRowText", this.font, geometryOptions))
        this.childrenMeshes.set("FrontMWLogo", new FrontMWLogoMesh("FrontMWLogo"))

        await Promise.all(
            [...this.childrenMeshes.values()].map(async mesh => {
                await mesh.init(geometryOptions)
                this.add(mesh)
            })
        )

        return this
    }

    async addCustomLogo(dataUrl: string, geometryOptions: GeometryOptions): Promise<void> {
        if (this.childrenMeshes.has("CustomLogo")) {
            this.removeCustomLogo()
        }

        const customLogoMesh = await new CustomLogoMesh("CustomLogo", dataUrl).init(geometryOptions)
        this.add(customLogoMesh)
        this.childrenMeshes.set(customLogoMesh.name, customLogoMesh)
    }

    rotateCustomLogo() {
        const customLogoMesh = this.childrenMeshes.get("CustomLogo") as CustomLogoMesh
        customLogoMesh.rotate()
    }

    flipCustomLogo() {
        const customLogoMesh = this.childrenMeshes.get("CustomLogo") as CustomLogoMesh
        customLogoMesh.flip()
    }

    removeCustomLogo() {
        this.remove(this.childrenMeshes.get("CustomLogo"))
        this.childrenMeshes.delete("CustomLogo")
    }

    updateCustomLogoColor(newColor: string) {
        const customLogoMesh = this.childrenMeshes.get("CustomLogo") as CustomLogoMesh
        customLogoMesh.setColor(newColor)
    }

    updateFrontText(frontText: string, geometryOptions: GeometryOptions) {
        geometryOptions.frontText = frontText
        const frontTextMesh = this.childrenMeshes.get("FrontText") as FrontTextMesh
        frontTextMesh.updateText(geometryOptions)
    }

    async changeSize(geometryOptions: GeometryOptions, oldWidth: number): Promise<void> {
        this.sizeChangeStrategy.execute(geometryOptions, { mesh: this, oldWidth } as SizeChangeScaleStrategyOptions)
        return
    }

    updateSecondRowText(secondRowText: string, geometryOptions: GeometryOptions) {
        geometryOptions.secondRowText = secondRowText
        const secondRowTextMesh = this.childrenMeshes.get("SecondRowText") as SecondRowTextMesh
        secondRowTextMesh.updateText(geometryOptions)
    }

    updateSecondRowVisibility(geometryOptions: GeometryOptions) {
        const frontMWLogoMesh = this.childrenMeshes.get("FrontMWLogo") as FrontMWLogoMesh
        const secondRowMesh = this.childrenMeshes.get("SecondRowText") as SecondRowTextMesh
        const customLogoMesh = this.childrenMeshes.get("CustomLogo") as CustomLogoMesh

        secondRowMesh.setManualVisibility(geometryOptions.secondRowVisible)

        frontMWLogoMesh.changeRelativeSize(geometryOptions)
        customLogoMesh?.changeRelativeSize(geometryOptions)
    }
}
